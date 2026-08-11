import {
    useEffect,
    useRef,
} from "react";

import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";


export default function ChatWindow({
    messages = [],
    isThinking = false,
}) {

    const bottomRef =
        useRef(null);


    /* =====================================================
       AUTO SCROLL
    ===================================================== */

    useEffect(() => {

        const anchor =
            bottomRef.current;


        if (!anchor) {
            return;
        }


        requestAnimationFrame(() => {

            anchor.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });

        });

    }, [
        messages,
        isThinking,
    ]);


    return (

        <div className="chatWindow">

            {messages.map(
                (message, index) => {

                    if (!message) {
                        return null;
                    }


                    const sender =
                        message.role ===
                        "assistant"
                            ? "ai"
                            : message.role;


                    const content =
                        message.content || "";


                    return (

                        <MessageBubble

                            key={
                                message.id ||
                                `${message.role}-${index}`
                            }

                            sender={
                                sender
                            }

                            message={
                                content
                            }

                        />
                    );
                }
            )}


            {isThinking && (
                <TypingIndicator />
            )}


            <div
                ref={bottomRef}
                className="chatBottomAnchor"
            />

        </div>
    );
}