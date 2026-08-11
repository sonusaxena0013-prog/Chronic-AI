import { useEffect, useRef, useState } from "react";
import {
  FiSend,
  FiPaperclip,
  FiMic,
  FiImage,
  FiX,
} from "react-icons/fi";

export default function PromptBar({
  onSend,
  onStop,
  isStreaming,

  onFileSelect,
  attachedFile,
  removeFile,

  onImageSelect,
  attachedImage,
  removeImage,
}) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Keep latest values available inside SpeechRecognition callbacks
  const isStreamingRef = useRef(isStreaming);
  const onSendRef = useRef(onSend);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    onSendRef.current = onSend;
  }, [onSend]);

  /* =====================================================
     AUTO RESIZE
  ===================================================== */

  function autoResize() {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  /* =====================================================
     RESET TEXTAREA
  ===================================================== */

  function resetTextarea() {
    setMessage("");

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
  }

  /* =====================================================
     SPEECH RECOGNITION
  ===================================================== */

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn(
        "Speech Recognition is not supported in this browser."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      const cleanTranscript = transcript.trim();

      setMessage(cleanTranscript);

      requestAnimationFrame(() => {
        autoResize();
      });

      const lastResult =
        event.results[event.results.length - 1];

      if (
        lastResult &&
        lastResult.isFinal &&
        cleanTranscript &&
        !isStreamingRef.current
      ) {
        sendText(cleanTranscript);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignore stop errors during cleanup
      }

      recognitionRef.current = null;
    };
  }, []);

  /* =====================================================
     FILE PICKER
  ===================================================== */

  function chooseFile() {
    if (isStreaming) return;

    fileInputRef.current?.click();
  }

  function chooseImage() {
    if (isStreaming) return;

    imageInputRef.current?.click();
  }

  /* =====================================================
     FILE SELECT
  ===================================================== */

  function handleFile(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    onFileSelect?.(file);

    // Allow selecting the same file again
    event.target.value = "";
  }

  /* =====================================================
     IMAGE SELECT
  ===================================================== */

  function handleImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    onImageSelect?.(file);

    // Allow selecting the same image again
    event.target.value = "";
  }

  /* =====================================================
     TEXT INPUT
  ===================================================== */

  function handleChange(event) {
    const value = event.target.value;

    setMessage(value);

    requestAnimationFrame(() => {
      autoResize();
    });
  }

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  async function sendText(text) {
    const cleanText = String(text || "").trim();

    if (!cleanText) return;

    if (isStreamingRef.current) return;

    /*
     * IMPORTANT:
     * Clear the prompt FIRST.
     *
     * This prevents the old command from remaining
     * inside the textbox while AI is generating.
     */
    resetTextarea();

    try {
      const sendFunction = onSendRef.current;

      if (typeof sendFunction !== "function") {
        console.error(
          "PromptBar: onSend is not a function."
        );
        return;
      }

      /*
       * Send the already-cleaned text.
       * We do NOT wait before clearing the input.
       */
      await sendFunction(cleanText);
    } catch (error) {
      console.error(
        "PromptBar send error:",
        error
      );
    }
  }

  /* =====================================================
     SEND BUTTON
  ===================================================== */

  function sendMessage() {
    const cleanText = message.trim();

    if (!cleanText) return;

    if (isStreaming) return;

    sendText(cleanText);
  }

  /* =====================================================
     ENTER KEY
  ===================================================== */

  function handleKeyDown(event) {
    if (event.key !== "Enter") return;

    /*
     * Shift + Enter = New line
     */
    if (event.shiftKey) {
      return;
    }

    /*
     * Enter = Send
     */
    event.preventDefault();

    if (!isStreaming) {
      sendMessage();
    }
  }

  /* =====================================================
     VOICE INPUT
  ===================================================== */

  function toggleVoice() {
    const recognition = recognitionRef.current;

    if (!recognition) {
      alert(
        "Speech Recognition is not supported in this browser."
      );
      return;
    }

    if (isStreaming) {
      return;
    }

    if (isListening) {
      try {
        recognition.stop();
      } catch {
        // Ignore stop errors
      }

      return;
    }

    /*
     * Start fresh voice input
     */
    resetTextarea();

    try {
      recognition.start();
    } catch (error) {
      console.warn(
        "Speech Recognition could not start:",
        error
      );
    }
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="promptWrapper">

      <div
        className={`promptContainer ${
          isStreaming ? "promptStreaming" : ""
        }`}
      >

        {/* =========================================
            FILE INPUT
        ========================================= */}

        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept=".pdf,.doc,.docx,.txt,.md"
          onChange={handleFile}
        />

        {/* =========================================
            IMAGE INPUT
        ========================================= */}

        <input
          type="file"
          ref={imageInputRef}
          hidden
          accept="image/*"
          onChange={handleImage}
        />

        {/* =========================================
            ATTACH FILE
        ========================================= */}

        <button
          className="toolBtn"
          type="button"
          onClick={chooseFile}
          aria-label="Attach file"
          disabled={isStreaming}
        >
          <FiPaperclip size={20} />
        </button>

        {/* =========================================
            ATTACH IMAGE
        ========================================= */}

        <button
          className="toolBtn"
          type="button"
          onClick={chooseImage}
          aria-label="Attach image"
          disabled={isStreaming}
        >
          <FiImage size={20} />
        </button>

        {/* =========================================
            ATTACHED FILE
        ========================================= */}

        {attachedFile && (
          <div className="attachedFile">

            <span>
              📄 {attachedFile.name}
            </span>

            <button
              className="removeFileBtn"
              type="button"
              onClick={removeFile}
              aria-label="Remove file"
            >
              <FiX />
            </button>

          </div>
        )}

        {/* =========================================
            ATTACHED IMAGE
        ========================================= */}

        {attachedImage && (
          <div className="attachedFile">

            <img
              src={URL.createObjectURL(attachedImage)}
              alt="Preview"
              width={45}
              height={45}
              style={{
                objectFit: "cover",
                borderRadius: "8px",
                marginRight: "10px",
              }}
            />

            <span>
              {attachedImage.name}
            </span>

            <button
              className="removeFileBtn"
              type="button"
              onClick={removeImage}
              aria-label="Remove image"
            >
              <FiX />
            </button>

          </div>
        )}

        {/* =========================================
            TEXT AREA
        ========================================= */}

        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          placeholder={
            isStreaming
              ? "Chronic AI is responding..."
              : "Message Chronic AI..."
          }
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={false}
        />

        {/* =========================================
            MICROPHONE
        ========================================= */}

        <button
          className={`toolBtn ${
            isListening ? "listening" : ""
          }`}
          type="button"
          aria-label="Voice Input"
          onClick={toggleVoice}
          disabled={isStreaming}
        >
          {isListening ? (
            "🔴"
          ) : (
            <FiMic size={20} />
          )}
        </button>

        {/* =========================================
            SEND / STOP
        ========================================= */}

        {isStreaming ? (
          <button
            className="sendBtn stopBtn"
            type="button"
            onClick={onStop}
            aria-label="Stop Response"
          >
            ⏹
          </button>
        ) : (
          <button
            className="sendBtn"
            type="button"
            onClick={sendMessage}
            disabled={!message.trim()}
            aria-label="Send Message"
          >
            <FiSend size={20} />
          </button>
        )}

      </div>
    </div>
  );
}