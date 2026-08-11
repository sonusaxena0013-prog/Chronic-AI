import "../styles/home.css";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { useChats } from "../context/ChatContext";

import WelcomeScreen from "../components/chat/WelcomeScreen";
import ChatWindow from "../components/chat/ChatWindow";
import PromptBar from "../components/chat/PromptBar";

import { getStreamingResponse } from "../api/ai";

import {
    generateImage,
    generateFileContent,
} from "../services/generation";

import { parseFile } from "../utils/fileParser";


export default function Home() {

    /* =====================================================
       CHAT CONTEXT
    ===================================================== */

    const {
        currentChat,
        currentChatId,
        createChat,
        addMessage,
        upsertMessage,
    } = useChats();


    /* =====================================================
       LOCAL CHAT
    ===================================================== */

    const [activeChatId, setActiveChatId] =
        useState(currentChatId || null);

    const [localMessages, setLocalMessages] =
        useState(
            currentChat?.messages || []
        );


    /* =====================================================
       AI STATES
    ===================================================== */

    const [isThinking, setIsThinking] =
        useState(false);

    const [isStreaming, setIsStreaming] =
        useState(false);


    /* =====================================================
       GENERATION
    ===================================================== */

    const [isGeneratingImage, setIsGeneratingImage] =
        useState(false);

    const [isGeneratingFile, setIsGeneratingFile] =
        useState(false);


    /* =====================================================
       FILE
    ===================================================== */

    const [attachedFile, setAttachedFile] =
        useState(null);

    const [documentText, setDocumentText] =
        useState("");


    /* =====================================================
       IMAGE
    ===================================================== */

    const [attachedImage, setAttachedImage] =
        useState(null);

    const [imageBase64, setImageBase64] =
        useState("");


    /* =====================================================
       REQUEST CONTROL
    ===================================================== */

    const requestRunningRef =
        useRef(false);

    const abortController =
        useRef(null);

    const activeChatIdRef =
        useRef(currentChatId || null);


    /* =====================================================
       KEEP ACTIVE CHAT REF UPDATED
    ===================================================== */

    useEffect(() => {
        activeChatIdRef.current =
            activeChatId;
    }, [activeChatId]);


    /* =====================================================
       CHAT ID SYNC
       IMPORTANT DELETE FIX
    ===================================================== */

    useEffect(() => {

        /*
         * NO CHAT SELECTED
         *
         * This is the important part that
         * clears the old deleted chat.
         */

        if (!currentChatId) {

            activeChatIdRef.current =
                null;

            setActiveChatId(null);

            setLocalMessages([]);

            setAttachedFile(null);
            setDocumentText("");

            setAttachedImage(null);
            setImageBase64("");

            return;
        }


        /*
         * Chat selected / switched.
         */

        activeChatIdRef.current =
            currentChatId;

        setActiveChatId(
            currentChatId
        );

    }, [currentChatId]);


    /* =====================================================
       MESSAGE SYNC
    ===================================================== */

    useEffect(() => {

        /*
         * No selected chat = no messages.
         */

        if (!currentChatId) {

            setLocalMessages([]);

            return;
        }


        /*
         * Only sync messages belonging
         * to currently selected chat.
         */

        if (
            currentChat &&
            currentChat.id === currentChatId
        ) {

            setLocalMessages(
                Array.isArray(
                    currentChat.messages
                )
                    ? currentChat.messages
                    : []
            );

        } else {

            /*
             * Prevent stale messages from
             * previous/deleted chat.
             */

            setLocalMessages([]);

        }

    }, [
        currentChat,
        currentChatId,
    ]);


    /* =====================================================
       DISPLAY MESSAGES
    ===================================================== */

    const messages =
        Array.isArray(localMessages)
            ? localMessages
            : [];


    /* =====================================================
       ENSURE CHAT
    ===================================================== */

    async function ensureChat() {

        let chatId =
            currentChatId ||
            activeChatIdRef.current;


        if (chatId) {

            return chatId;
        }


        chatId =
            await createChat();


        if (!chatId) {

            console.error(
                "Unable to create chat."
            );

            return null;
        }


        activeChatIdRef.current =
            chatId;

        setActiveChatId(chatId);


        return chatId;
    }


    /* =====================================================
       FILE SELECT
    ===================================================== */

    async function handleFileSelect(file) {

        if (!file) {
            return;
        }


        try {

            const text =
                await parseFile(file);


            if (
                !text ||
                !text.trim()
            ) {

                alert(
                    "This file does not contain readable text."
                );

                return;
            }


            setAttachedFile(file);

            setDocumentText(text);


            setAttachedImage(null);

            setImageBase64("");

        } catch (error) {

            console.error(
                "File parsing error:",
                error
            );

            alert(
                "Unable to read this file."
            );
        }
    }


    /* =====================================================
       IMAGE SELECT
    ===================================================== */

    function handleImageSelect(file) {

        if (!file) {
            return;
        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please select a valid image."
            );

            return;
        }


        setAttachedImage(file);

        setAttachedFile(null);

        setDocumentText("");


        const reader =
            new FileReader();


        reader.onload = () => {

            setImageBase64(
                reader.result
            );
        };


        reader.onerror = () => {

            console.error(
                "Unable to read image."
            );

            setAttachedImage(null);

            setImageBase64("");
        };


        reader.readAsDataURL(file);
    }


    /* =====================================================
       REMOVE FILE
    ===================================================== */

    function removeFile() {

        setAttachedFile(null);

        setDocumentText("");
    }


    /* =====================================================
       REMOVE IMAGE
    ===================================================== */

    function removeImage() {

        setAttachedImage(null);

        setImageBase64("");
    }


    /* =====================================================
       LOCAL MESSAGE
    ===================================================== */

    function addLocalMessage(message) {

        setLocalMessages(
            previous => [
                ...previous,
                message,
            ]
        );
    }


    /* =====================================================
       GENERATE IMAGE
    ===================================================== */

    async function handleGenerateImage(prompt) {

        const cleanPrompt =
            String(prompt || "")
                .trim();


        if (!cleanPrompt) {
            return;
        }


        if (
            requestRunningRef.current ||
            isGeneratingImage ||
            isGeneratingFile ||
            isStreaming
        ) {
            return;
        }


        requestRunningRef.current =
            true;

        setIsGeneratingImage(true);


        let chatId = null;


        try {

            chatId =
                await ensureChat();


            if (!chatId) {
                return;
            }


            const userMessage = {

                id:
                    crypto.randomUUID(),

                role:
                    "user",

                content:
                    `🎨 Generate Image: ${cleanPrompt}`,

                timestamp:
                    Date.now(),
            };


            addLocalMessage(
                userMessage
            );


            await addMessage(
                chatId,
                userMessage
            );


            const result =
                await generateImage(
                    cleanPrompt
                );


            if (
                !result ||
                !result.url
            ) {

                throw new Error(
                    "Image generation returned no image."
                );
            }


            /*
             * Don't restore deleted chat.
             */

            if (
                activeChatIdRef.current !==
                chatId
            ) {
                return;
            }


            const imageMessage = {

                id:
                    crypto.randomUUID(),

                role:
                    "assistant",

                type:
                    "image",

                content:
                    result.url,

                imageUrl:
                    result.url,

                prompt:
                    cleanPrompt,

                timestamp:
                    Date.now(),
            };


            addLocalMessage(
                imageMessage
            );


            await addMessage(
                chatId,
                imageMessage
            );

        } catch (error) {

            console.error(
                "Image generation error:",
                error
            );


            if (
                !chatId ||
                activeChatIdRef.current !==
                    chatId
            ) {
                return;
            }


            const errorMessage = {

                id:
                    crypto.randomUUID(),

                role:
                    "assistant",

                content:
                    "❌ I couldn't generate the image right now. Please try again.",

                timestamp:
                    Date.now(),
            };


            addLocalMessage(
                errorMessage
            );


            await addMessage(
                chatId,
                errorMessage
            );

        } finally {

            requestRunningRef.current =
                false;

            setIsGeneratingImage(false);
        }
    }


    /* =====================================================
       GENERATE FILE
    ===================================================== */

    async function handleGenerateFile(prompt) {

        const cleanPrompt =
            String(prompt || "")
                .trim();


        if (!cleanPrompt) {
            return;
        }


        if (
            requestRunningRef.current ||
            isGeneratingImage ||
            isGeneratingFile ||
            isStreaming
        ) {
            return;
        }


        requestRunningRef.current =
            true;

        setIsGeneratingFile(true);


        let chatId = null;


        try {

            chatId =
                await ensureChat();


            if (!chatId) {
                return;
            }


            const userMessage = {

                id:
                    crypto.randomUUID(),

                role:
                    "user",

                content:
                    `📄 Generate File: ${cleanPrompt}`,

                timestamp:
                    Date.now(),
            };


            addLocalMessage(
                userMessage
            );


            await addMessage(
                chatId,
                userMessage
            );


            const result =
                await generateFileContent(
                    cleanPrompt,
                    "txt"
                );


            if (
                !result ||
                !result.content
            ) {

                throw new Error(
                    "File generation returned no content."
                );
            }


            if (
                activeChatIdRef.current !==
                chatId
            ) {
                return;
            }


            const fileMessage = {

                id:
                    crypto.randomUUID(),

                role:
                    "assistant",

                type:
                    "file",

                content:
                    result.content,

                fileContent:
                    result.content,

                fileName:
                    "chronic-ai-generated.txt",

                fileFormat:
                    "txt",

                prompt:
                    cleanPrompt,

                timestamp:
                    Date.now(),
            };


            addLocalMessage(
                fileMessage
            );


            await addMessage(
                chatId,
                fileMessage
            );

        } catch (error) {

            console.error(
                "File generation error:",
                error
            );


            if (
                !chatId ||
                activeChatIdRef.current !==
                    chatId
            ) {
                return;
            }


            const errorMessage = {

                id:
                    crypto.randomUUID(),

                role:
                    "assistant",

                content:
                    "❌ I couldn't generate the file right now. Please try again.",

                timestamp:
                    Date.now(),
            };


            addLocalMessage(
                errorMessage
            );


            await addMessage(
                chatId,
                errorMessage
            );

        } finally {

            requestRunningRef.current =
                false;

            setIsGeneratingFile(false);
        }
    }


    /* =====================================================
       SEND MESSAGE
    ===================================================== */

    async function sendMessage(text) {

        const cleanText =
            text?.trim();


        if (!cleanText) {
            return;
        }


        if (
            requestRunningRef.current
        ) {
            return;
        }


        requestRunningRef.current =
            true;


        let chatId =
            currentChatId ||
            activeChatIdRef.current;


        try {

            /* CREATE CHAT */

            if (!chatId) {

                chatId =
                    await createChat();


                if (!chatId) {

                    console.error(
                        "Unable to automatically create chat."
                    );

                    return;
                }


                activeChatIdRef.current =
                    chatId;

                setActiveChatId(
                    chatId
                );
            }


            /* ATTACHMENT SNAPSHOT */

            const currentDocumentText =
                documentText;

            const currentImageBase64 =
                imageBase64;

            const currentFile =
                attachedFile;

            const currentImage =
                attachedImage;


            /* DISPLAY MESSAGE */

            let displayContent =
                cleanText;


            if (currentFile) {

                displayContent +=
                    `\n\n📄 ${currentFile.name}`;
            }


            if (currentImage) {

                displayContent +=
                    `\n\n🖼️ ${currentImage.name}`;
            }


            const userMessage = {

                id:
                    crypto.randomUUID(),

                role:
                    "user",

                content:
                    displayContent,

                timestamp:
                    Date.now(),
            };


            /*
             * Only add to local screen
             * if this chat is still active.
             */

            if (
                activeChatIdRef.current ===
                chatId
            ) {

                setLocalMessages(
                    previous => [
                        ...previous,
                        userMessage,
                    ]
                );
            }


            await addMessage(
                chatId,
                userMessage
            );


            /* CLEAR ATTACHMENTS */

            setAttachedFile(null);

            setDocumentText("");

            setAttachedImage(null);

            setImageBase64("");


            /* AI QUESTION */

            let finalQuestion =
                cleanText;


            if (
                currentDocumentText
            ) {

                finalQuestion = `
Uploaded Document:

${currentDocumentText}

---

User Question:

${cleanText}
                `.trim();
            }


            /* PREVIOUS HISTORY */

            const previousMessages =
                messages.map(
                    message => ({

                        role:
                            message.role,

                        content:
                            message.content,
                    })
                );


            const chatMessages = [

                ...previousMessages,

                {
                    role:
                        "user",

                    content:
                        finalQuestion,
                },
            ];


            /* AI PLACEHOLDER */

            const aiId =
                crypto.randomUUID();


            const initialAiMessage = {

                id:
                    aiId,

                role:
                    "assistant",

                content:
                    "",

                timestamp:
                    Date.now(),
            };


            if (
                activeChatIdRef.current ===
                chatId
            ) {

                setLocalMessages(
                    previous => [
                        ...previous,
                        initialAiMessage,
                    ]
                );
            }


            await addMessage(
                chatId,
                initialAiMessage
            );


            /* STREAM */

            setIsThinking(true);

            setIsStreaming(true);


            abortController.current =
                new AbortController();


            let fullResponse =
                "";


            await getStreamingResponse(

                chatMessages,

                chunk => {

                    if (!chunk) {
                        return;
                    }


                    /*
                     * VERY IMPORTANT:
                     * If the chat has been deleted
                     * or another chat selected,
                     * don't put old response on screen.
                     */

                    if (
                        activeChatIdRef.current !==
                        chatId
                    ) {

                        return;
                    }


                    fullResponse +=
                        chunk;


                    const updatedAiMessage = {

                        id:
                            aiId,

                        role:
                            "assistant",

                        content:
                            fullResponse,

                        timestamp:
                            Date.now(),
                    };


                    setLocalMessages(
                        previous =>
                            previous.map(
                                message =>
                                    message.id === aiId
                                        ? updatedAiMessage
                                        : message
                            )
                    );


                    upsertMessage(
                        chatId,
                        aiId,
                        updatedAiMessage
                    );
                },

                abortController.current
                    .signal,

                currentImageBase64 ||
                    null
            );


            /* CHAT WAS DELETED DURING STREAM */

            if (
                activeChatIdRef.current !==
                chatId
            ) {
                return;
            }


            /* EMPTY RESPONSE */

            if (
                !fullResponse.trim()
            ) {

                const emptyResponse = {

                    id:
                        aiId,

                    role:
                        "assistant",

                    content:
                        "I didn't receive a response. Please try again.",

                    timestamp:
                        Date.now(),
                };


                setLocalMessages(
                    previous =>
                        previous.map(
                            message =>
                                message.id === aiId
                                    ? emptyResponse
                                    : message
                        )
                );


                await upsertMessage(
                    chatId,
                    aiId,
                    emptyResponse
                );
            }

        } catch (error) {

            console.error(
                "Chronic AI error:",
                error
            );


            if (
                error?.name ===
                "AbortError"
            ) {
                return;
            }


            /*
             * Don't show errors for
             * deleted/switching chat.
             */

            if (
                !chatId ||
                activeChatIdRef.current !==
                    chatId
            ) {
                return;
            }


            const errorMessage = {

                id:
                    crypto.randomUUID(),

                role:
                    "assistant",

                content:
                    "❌ Sorry, something went wrong while processing your request.",

                timestamp:
                    Date.now(),
            };


            setLocalMessages(
                previous => [
                    ...previous,
                    errorMessage,
                ]
            );


            await addMessage(
                chatId,
                errorMessage
            );

        } finally {

            requestRunningRef.current =
                false;

            abortController.current =
                null;

            setIsThinking(false);

            setIsStreaming(false);
        }
    }


    /* =====================================================
       STOP
    ===================================================== */

    function stopGeneration() {

        if (
            abortController.current
        ) {

            abortController.current.abort();
        }


        requestRunningRef.current =
            false;

        setIsStreaming(false);

        setIsThinking(false);
    }


    /* =====================================================
       UI
    ===================================================== */

    return (

        <main className="home">

            <div className="homeContent">

                {messages.length === 0 &&
                !isThinking &&
                !isStreaming &&
                !isGeneratingImage &&
                !isGeneratingFile ? (

                    <WelcomeScreen
                        onPromptSelect={
                            prompt => {
                                sendMessage(prompt);
                            }
                        }
                    />

                ) : (

                    <ChatWindow
                        messages={
                            messages
                        }

                        isThinking={
                            isThinking ||
                            isGeneratingImage ||
                            isGeneratingFile
                        }
                    />
                )}

            </div>


            <div className="homePromptArea">

                <PromptBar

                    /* NORMAL CHAT */

                    onSend={
                        sendMessage
                    }

                    onStop={
                        stopGeneration
                    }

                    isStreaming={
                        isStreaming
                    }


                    /* FILE */

                    onFileSelect={
                        handleFileSelect
                    }

                    attachedFile={
                        attachedFile
                    }

                    removeFile={
                        removeFile
                    }


                    /* IMAGE */

                    onImageSelect={
                        handleImageSelect
                    }

                    attachedImage={
                        attachedImage
                    }

                    removeImage={
                        removeImage
                    }


                    /* GENERATE IMAGE */

                    onGenerateImage={
                        handleGenerateImage
                    }

                    isGeneratingImage={
                        isGeneratingImage
                    }


                    /* GENERATE FILE */

                    onGenerateFile={
                        handleGenerateFile
                    }

                    isGeneratingFile={
                        isGeneratingFile
                    }

                />

            </div>

        </main>
    );
}