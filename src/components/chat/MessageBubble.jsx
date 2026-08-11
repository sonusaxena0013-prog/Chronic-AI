import { memo, useState } from "react";

import {
  FiUser,
  FiCopy,
  FiCheck,
  FiThumbsUp,
  FiThumbsDown,
  FiVolume2,
  FiSquare,
  FiRotateCcw,
  FiShare2,
  FiDownload,
} from "react-icons/fi";

import { BsRobot } from "react-icons/bs";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import CodeBlock from "./CodeBlock";

function MessageBubble({

  id,

  sender,

  message,

  timestamp,

  onRegenerate,

  onDelete,

}) {

  const isAI = sender === "ai";

  const [copied, setCopied] = useState(false);

  const [liked, setLiked] = useState(false);

  const [disliked, setDisliked] = useState(false);

  const [speaking, setSpeaking] = useState(false);

  async function copyMessage() {

    try {

      await navigator.clipboard.writeText(message);

      setCopied(true);

      setTimeout(() => {

        setCopied(false);

      }, 2000);

    } catch (err) {

      console.error(err);

    }

  }

  function speakMessage() {

    if (!("speechSynthesis" in window)) {

      alert("Speech synthesis not supported.");

      return;

    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);

    utterance.lang = "en-US";

    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.onstart = () => {

      setSpeaking(true);

    };

    utterance.onend = () => {

      setSpeaking(false);

    };

    window.speechSynthesis.speak(utterance);

  }

  function stopSpeaking() {

    window.speechSynthesis.cancel();

    setSpeaking(false);

  }

  function exportMessage() {

    const blob = new Blob(

      [message],

      {

        type: "text/plain",

      }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "message.txt";

    a.click();

    URL.revokeObjectURL(url);

  }

  async function shareMessage() {

    if (navigator.share) {

      try {

        await navigator.share({

          text: message,

        });

      } catch {}

    } else {

      copyMessage();

    }

  }

    return (

    <div className={`messageRow ${isAI ? "ai" : "user"}`}>

      <div className="avatar">

        {isAI ? <BsRobot /> : <FiUser />}

      </div>

      <div className="messageBubble">

        {isAI && (

          <div className="messageActions">

            <button
              className="actionBtn"
              onClick={copyMessage}
              title="Copy"
            >

              {copied ? <FiCheck /> : <FiCopy />}

            </button>

            <button
              className={`actionBtn ${liked ? "active" : ""}`}
              onClick={() => {

                setLiked(!liked);

                setDisliked(false);

              }}
              title="Like"
            >

              <FiThumbsUp />

            </button>

            <button
              className={`actionBtn ${disliked ? "active" : ""}`}
              onClick={() => {

                setDisliked(!disliked);

                setLiked(false);

              }}
              title="Dislike"
            >

              <FiThumbsDown />

            </button>

            <button
              className="actionBtn"
              onClick={speaking ? stopSpeaking : speakMessage}
              title="Read Aloud"
            >

              {speaking ? <FiSquare /> : <FiVolume2 />}

            </button>

            <button
              className="actionBtn"
              onClick={shareMessage}
              title="Share"
            >

              <FiShare2 />

            </button>

            <button
              className="actionBtn"
              onClick={exportMessage}
              title="Download"
            >

              <FiDownload />

            </button>

            {onRegenerate && (

              <button
                className="actionBtn"
                onClick={onRegenerate}
                title="Regenerate"
              >

                <FiRotateCcw />

              </button>

            )}

          </div>

        )}

        {isAI ? (

          <ReactMarkdown

            remarkPlugins={[remarkGfm]}

            components={{

              code({

                inline,

                className,

                children,

              }) {

                const match =
                  /language-(\w+)/.exec(
                    className || ""
                  );

                if (inline) {

                  return (

                    <code
                      className={className}
                    >

                      {children}

                    </code>

                  );

                }

                return (

                  <CodeBlock
                    language={
                      match
                        ? match[1]
                        : "text"
                    }
                  >

                    {String(children).replace(
                      /\n$/,
                      ""
                    )}

                  </CodeBlock>

                );

              },

            }}

          >

            {message}

          </ReactMarkdown>

        ) : (

          <p>{message}</p>

        )}

        <div className="messageFooter">

          <span className="messageTime">
  {timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}
</span>
        </div>

      </div>

    </div>

  );

  }

export default memo(

  MessageBubble,

  (prev, next) => {

    return (

      prev.message === next.message &&

      prev.sender === next.sender &&

      prev.timestamp === next.timestamp

    );

  }

);