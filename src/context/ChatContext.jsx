import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {

    /* =====================================================
       AUTH
    ===================================================== */

    const {
        user,
        loading: authLoading,
    } = useAuth();


    /* =====================================================
       STATE
    ===================================================== */

    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [loading, setLoading] = useState(true);


    /* =====================================================
       REFS
    ===================================================== */

    const chatsRef = useRef([]);
    const currentChatIdRef = useRef(null);
    const userRef = useRef(null);


    /* =====================================================
       KEEP REFS UPDATED
    ===================================================== */

    useEffect(() => {
        chatsRef.current = chats;
    }, [chats]);


    useEffect(() => {
        currentChatIdRef.current = currentChatId;
    }, [currentChatId]);


    useEffect(() => {
        userRef.current = user;
    }, [user]);


    /* =====================================================
       LOAD CHATS
    ===================================================== */

    useEffect(() => {

        let mounted = true;

        async function loadChats() {

            /* ---------------------------------------------
               WAIT FOR AUTH
            --------------------------------------------- */

            if (authLoading) {
                return;
            }


            /* ---------------------------------------------
               LOGGED OUT
            --------------------------------------------- */

            if (!user) {

                chatsRef.current = [];

                currentChatIdRef.current = null;

                if (mounted) {
                    setChats([]);
                    setCurrentChatId(null);
                    setLoading(false);
                }

                return;
            }


            /* ---------------------------------------------
               LOADING
            --------------------------------------------- */

            if (mounted) {
                setLoading(true);
            }


            /* ---------------------------------------------
               FETCH CHATS
            --------------------------------------------- */

            const {
                data,
                error,
            } = await supabase
                .from("chats")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: false,
                });


            /* ---------------------------------------------
               DATABASE ERROR
            --------------------------------------------- */

            if (error) {

                console.error(
                    "Chat loading error:",
                    error
                );

                if (mounted) {

                    setChats([]);

                    currentChatIdRef.current = null;

                    setCurrentChatId(null);

                    setLoading(false);
                }

                return;
            }


            /* ---------------------------------------------
               FORMAT CHATS
            --------------------------------------------- */

            const formattedChats =
                (data || []).map((chat) => ({

                    id:
                        chat.id,

                    userId:
                        chat.user_id,

                    title:
                        chat.title ||
                        "New Chat",

                    createdAt:
                        chat.created_at,

                    messages:
                        Array.isArray(chat.messages)
                            ? chat.messages
                            : [],

                }));


            /* ---------------------------------------------
               UPDATE REFS
            --------------------------------------------- */

            chatsRef.current =
                formattedChats;


            if (!mounted) {
                return;
            }


            /* ---------------------------------------------
               UPDATE CHAT LIST
            --------------------------------------------- */

            setChats(formattedChats);


            /* ---------------------------------------------
               IMPORTANT
               
               DO NOT AUTOMATICALLY OPEN
               THE FIRST / OLD CHAT.
               
               History remains visible in Sidebar,
               but Home opens as a fresh screen.
            --------------------------------------------- */

            currentChatIdRef.current = null;

            setCurrentChatId(null);


            /* ---------------------------------------------
               FINISH LOADING
            --------------------------------------------- */

            setLoading(false);
        }


        loadChats();


        /* ---------------------------------------------
           CLEANUP
        --------------------------------------------- */

        return () => {
            mounted = false;
        };

    }, [user, authLoading]);


    /* =====================================================
       CREATE CHAT
    ===================================================== */

    const createChat = async () => {

        const currentUser =
            userRef.current;


        if (!currentUser) {

            console.warn(
                "Cannot create chat: user is not logged in."
            );

            return null;
        }


        /* ---------------------------------------------
           GENERATE UUID
        --------------------------------------------- */

        const chatId =
            crypto.randomUUID();


        /* ---------------------------------------------
           CREATED AT
           Supabase column = BIGINT
        --------------------------------------------- */

        const createdAt =
            Date.now();


        /* ---------------------------------------------
           DATABASE OBJECT
        --------------------------------------------- */

        const newChat = {

            id:
                chatId,

            user_id:
                currentUser.id,

            title:
                "New Chat",

            messages:
                [],

            created_at:
                createdAt,
        };


        console.log(
            "Creating chat:",
            newChat
        );


        /* ---------------------------------------------
           INSERT
        --------------------------------------------- */

        const {
            data,
            error,
        } = await supabase
            .from("chats")
            .insert(newChat)
            .select()
            .single();


        if (error) {

            console.error(
                "Create chat error:",
                error
            );

            console.error(
                "Create chat error details:",
                {
                    code:
                        error.code,

                    message:
                        error.message,

                    details:
                        error.details,

                    hint:
                        error.hint,
                }
            );

            return null;
        }


        /* ---------------------------------------------
           FORMAT CREATED CHAT
        --------------------------------------------- */

        const formattedChat = {

            id:
                data?.id ||
                chatId,

            userId:
                data?.user_id ||
                currentUser.id,

            title:
                data?.title ||
                "New Chat",

            createdAt:
                data?.created_at ??
                createdAt,

            messages:
                Array.isArray(data?.messages)
                    ? data.messages
                    : [],
        };


        /* ---------------------------------------------
           ADD TO LOCAL STATE
        --------------------------------------------- */

        const updatedChats = [

            formattedChat,

            ...chatsRef.current.filter(
                (chat) =>
                    chat.id !==
                    formattedChat.id
            ),

        ];


        chatsRef.current =
            updatedChats;

        setChats(updatedChats);


        /* ---------------------------------------------
           SELECT NEW CHAT
        --------------------------------------------- */

        currentChatIdRef.current =
            formattedChat.id;

        setCurrentChatId(
            formattedChat.id
        );


        return formattedChat.id;
    };


    /* =====================================================
       SELECT CHAT
    ===================================================== */

    const selectChat = (id) => {

        if (!id) {
            return;
        }


        const exists =
            chatsRef.current.some(
                (chat) =>
                    chat.id === id
            );


        if (!exists) {
            return;
        }


        currentChatIdRef.current =
            id;

        setCurrentChatId(id);
    };


    /* =====================================================
       DELETE CHAT
    ===================================================== */

    const deleteChat = async (id) => {

        const currentUser =
            userRef.current;


        if (!currentUser || !id) {
            return false;
        }


        const deletingCurrent =
            currentChatIdRef.current === id;


        /* ---------------------------------------------
           DELETE FROM SUPABASE
        --------------------------------------------- */

        const {
            error,
        } = await supabase
            .from("chats")
            .delete()
            .eq(
                "id",
                id
            )
            .eq(
                "user_id",
                currentUser.id
            );


        if (error) {

            console.error(
                "Delete chat error:",
                error
            );

            return false;
        }


        /* ---------------------------------------------
           REMOVE LOCALLY
        --------------------------------------------- */

        const updatedChats =
            chatsRef.current.filter(
                (chat) =>
                    chat.id !== id
            );


        chatsRef.current =
            updatedChats;

        setChats(updatedChats);


        /* ---------------------------------------------
           IF CURRENT CHAT WAS DELETED
        --------------------------------------------- */

        if (deletingCurrent) {

            /*
             * IMPORTANT:
             * Do NOT automatically switch
             * to another old chat.
             *
             * Return to fresh Home instead.
             */

            currentChatIdRef.current =
                null;

            setCurrentChatId(null);
        }


        return true;
    };


    /* =====================================================
       CLEAR ALL CHATS
    ===================================================== */

    const clearAllChats = async () => {

        const currentUser =
            userRef.current;


        if (!currentUser) {
            return false;
        }


        const {
            error,
        } = await supabase
            .from("chats")
            .delete()
            .eq(
                "user_id",
                currentUser.id
            );


        if (error) {

            console.error(
                "Clear chats error:",
                error
            );

            return false;
        }


        chatsRef.current = [];

        setChats([]);


        currentChatIdRef.current =
            null;

        setCurrentChatId(null);


        return true;
    };


    /* =====================================================
       RENAME CHAT
    ===================================================== */

    const renameChat = async (
        id,
        title
    ) => {

        const currentUser =
            userRef.current;


        if (!currentUser || !id) {
            return false;
        }


        const cleanTitle =
            String(title || "")
                .trim()
                .slice(0, 80);


        if (!cleanTitle) {
            return false;
        }


        /* ---------------------------------------------
           DATABASE
        --------------------------------------------- */

        const {
            error,
        } = await supabase
            .from("chats")
            .update({
                title:
                    cleanTitle,
            })
            .eq(
                "id",
                id
            )
            .eq(
                "user_id",
                currentUser.id
            );


        if (error) {

            console.error(
                "Rename chat error:",
                error
            );

            return false;
        }


        /* ---------------------------------------------
           LOCAL
        --------------------------------------------- */

        const updatedChats =
            chatsRef.current.map(
                (chat) =>
                    chat.id === id
                        ? {
                            ...chat,
                            title:
                                cleanTitle,
                        }
                        : chat
            );


        chatsRef.current =
            updatedChats;

        setChats(updatedChats);


        return true;
    };


    /* =====================================================
       ADD MESSAGE
    ===================================================== */

    const addMessage = async (
        chatId,
        message
    ) => {

        const currentUser =
            userRef.current;


        if (!currentUser || !chatId) {
            return false;
        }


        const existingChat =
            chatsRef.current.find(
                (chat) =>
                    chat.id === chatId
            );


        if (!existingChat) {

            console.warn(
                "Chat not found:",
                chatId
            );

            return false;
        }


        /* ---------------------------------------------
           OLD MESSAGES
        --------------------------------------------- */

        const oldMessages =
            Array.isArray(
                existingChat.messages
            )
                ? existingChat.messages
                : [];


        /* ---------------------------------------------
           NEW MESSAGES
        --------------------------------------------- */

        const newMessages = [

            ...oldMessages,

            message,

        ];


        /* ---------------------------------------------
           AUTO TITLE
        --------------------------------------------- */

        let title =
            existingChat.title ||
            "New Chat";


        const isUserMessage =
            message?.role === "user" ||
            message?.sender === "user";


        const messageText =
            message?.content ||
            message?.message ||
            message?.text ||
            "";


        if (
            title === "New Chat" &&
            isUserMessage &&
            String(messageText).trim()
        ) {

            const firstLine =
                String(messageText)
                    .replace(/\s+/g, " ")
                    .trim();


            title =
                firstLine.length > 42
                    ? firstLine.slice(0, 42) + "..."
                    : firstLine;
        }


        /* ---------------------------------------------
           UPDATED CHAT
        --------------------------------------------- */

        const updatedChat = {

            ...existingChat,

            title,

            messages:
                newMessages,
        };


        /* ---------------------------------------------
           LOCAL
        --------------------------------------------- */

        const updatedChats =
            chatsRef.current.map(
                (chat) =>
                    chat.id === chatId
                        ? updatedChat
                        : chat
            );


        chatsRef.current =
            updatedChats;

        setChats(updatedChats);


        /* ---------------------------------------------
           DATABASE
        --------------------------------------------- */

        const {
            error,
        } = await supabase
            .from("chats")
            .update({
                title,
                messages:
                    newMessages,
            })
            .eq(
                "id",
                chatId
            )
            .eq(
                "user_id",
                currentUser.id
            );


        if (error) {

            console.error(
                "Add message save error:",
                error
            );

            return false;
        }


        return true;
    };


    /* =====================================================
       UPSERT STREAMING MESSAGE
    ===================================================== */

    const upsertMessage = async (
        chatId,
        messageId,
        message
    ) => {

        const currentUser =
            userRef.current;


        if (
            !currentUser ||
            !chatId ||
            !messageId
        ) {
            return false;
        }


        /* ---------------------------------------------
           CHECK CHAT
        --------------------------------------------- */

        const existingChat =
            chatsRef.current.find(
                (chat) =>
                    chat.id === chatId
            );


        if (!existingChat) {

            console.warn(
                "Ignoring stream update: chat was deleted.",
                chatId
            );

            return false;
        }


        /* ---------------------------------------------
           OLD MESSAGES
        --------------------------------------------- */

        const oldMessages =
            Array.isArray(
                existingChat.messages
            )
                ? [
                    ...existingChat.messages,
                ]
                : [];


        const index =
            oldMessages.findIndex(
                (msg) =>
                    msg?.id === messageId
            );


        let newMessages;


        if (index === -1) {

            newMessages = [

                ...oldMessages,

                message,

            ];

        } else {

            newMessages = [

                ...oldMessages,

            ];

            newMessages[index] =
                message;
        }


        /* ---------------------------------------------
           LOCAL UPDATE
        --------------------------------------------- */

        const updatedChats =
            chatsRef.current.map(
                (chat) =>
                    chat.id === chatId
                        ? {
                            ...chat,
                            messages:
                                newMessages,
                        }
                        : chat
            );


        chatsRef.current =
            updatedChats;

        setChats(updatedChats);


        /* ---------------------------------------------
           DATABASE
        --------------------------------------------- */

        const {
            error,
        } = await supabase
            .from("chats")
            .update({
                messages:
                    newMessages,
            })
            .eq(
                "id",
                chatId
            )
            .eq(
                "user_id",
                currentUser.id
            );


        if (error) {

            if (
                error.code === "PGRST116" ||
                error.code === "23503"
            ) {

                console.warn(
                    "Ignoring stream save: chat no longer exists."
                );

                return false;
            }


            console.error(
                "Streaming save error:",
                error
            );

            return false;
        }


        return true;
    };


    /* =====================================================
       REPLACE ALL MESSAGES
    ===================================================== */

    const setMessages = async (
        chatId,
        messages
    ) => {

        const currentUser =
            userRef.current;


        if (!currentUser || !chatId) {
            return false;
        }


        const existingChat =
            chatsRef.current.find(
                (chat) =>
                    chat.id === chatId
            );


        if (!existingChat) {

            console.warn(
                "Cannot set messages: chat not found."
            );

            return false;
        }


        const safeMessages =
            Array.isArray(messages)
                ? messages
                : [];


        /* ---------------------------------------------
           LOCAL
        --------------------------------------------- */

        const updatedChats =
            chatsRef.current.map(
                (chat) =>
                    chat.id === chatId
                        ? {
                            ...chat,
                            messages:
                                safeMessages,
                        }
                        : chat
            );


        chatsRef.current =
            updatedChats;

        setChats(updatedChats);


        /* ---------------------------------------------
           DATABASE
        --------------------------------------------- */

        const {
            error,
        } = await supabase
            .from("chats")
            .update({
                messages:
                    safeMessages,
            })
            .eq(
                "id",
                chatId
            )
            .eq(
                "user_id",
                currentUser.id
            );


        if (error) {

            console.error(
                "Set messages error:",
                error
            );

            return false;
        }


        return true;
    };


    /* =====================================================
       CURRENT CHAT
    ===================================================== */

    const currentChat =
        chats.find(
            (chat) =>
                chat.id === currentChatId
        ) || null;


    /* =====================================================
       PROVIDER
    ===================================================== */

    return (
        <ChatContext.Provider
            value={{

                chats,

                setChats,

                currentChat,

                currentChatId,

                setCurrentChatId:
                    selectChat,

                createChat,

                deleteChat,

                clearAllChats,

                renameChat,

                addMessage,

                upsertMessage,

                setMessages,

                loading,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}


/* =====================================================
   HOOK
===================================================== */

export function useChats() {

    const context =
        useContext(ChatContext);


    if (!context) {

        throw new Error(
            "useChats must be used inside ChatProvider"
        );
    }


    return context;
}