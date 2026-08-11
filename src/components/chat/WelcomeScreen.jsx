import { motion } from "framer-motion";
import "../../styles/welcome.css";

const quickActions = [
  {
    emoji: "💧",
    title: "Smart Writing",
    text: "Write emails, reports and professional documents.",
    prompt: "Help me write a professional email or document.",
  },
  {
    emoji: "⚗️",
    title: "Creative Ideas",
    text: "Brainstorm ideas, plans and content.",
    prompt: "Give me 10 creative ideas.",
  },
  {
    emoji: "📊",
    title: "Research & Learning",
    text: "Summarize information and explain complex topics.",
    prompt: "Research this topic in detail.",
  },
  {
    emoji: "🤖",
    title: "Ask Chronic AI",
    text: "Ask questions, write content and solve problems instantly.",
    prompt: "Hello Chronic AI!",
  },
];

const suggestions = [
  {
    label: "✍ Write an Email",
    prompt: "Write a professional email about ",
  },
  {
    label: "📄 Summarize a Document",
    prompt: "Summarize this document.",
  },
  {
    label: "💡 Explain a Topic",
    prompt: "Explain ",
  },
  {
    label: "💻 Help with Coding",
    prompt: "Help me write code for ",
  },
];

export default function WelcomeScreen({ onPromptSelect }) {
  return (
    <section className="welcome">

      {/* =================================================
          HERO
      ================================================= */}

      <motion.div
        className="hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <h1>
          Welcome to <span>Chronic AI</span>
        </h1>

        <p>
          Your intelligent AI assistant for writing,
          learning, coding and everyday tasks.
        </p>
      </motion.div>


      {/* =================================================
          QUICK ACTION CARDS
          IMPORTANT:
          Plain button intentionally used here.
          CSS controls hover transform + shine.
      ================================================= */}

      <motion.div
        className="cards"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.2,
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {quickActions.map((item) => (
          <button
            key={item.title}
            type="button"
            className="card"
            onClick={() => onPromptSelect(item.prompt)}
          >
            <div className="emoji">
              {item.emoji}
            </div>

            <h3>{item.title}</h3>

            <p>{item.text}</p>
          </button>
        ))}
      </motion.div>


      {/* =================================================
          SUGGESTIONS
      ================================================= */}

      <motion.div
        className="suggestions"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.35,
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <h4>Try asking...</h4>

        <div className="suggestionGrid">
          {suggestions.map((item) => (
            <button
              key={item.label}
              type="button"
              className="suggestionCard"
              onClick={() => onPromptSelect(item.prompt)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </motion.div>

    </section>
  );
}