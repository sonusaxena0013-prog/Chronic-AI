import { useState } from "react";
import {
  FiHelpCircle,
  FiSearch,
  FiMessageCircle,
  FiBookOpen,
  FiZap,
  FiShield,
  FiChevronDown,
  FiMail,
  FiExternalLink,
} from "react-icons/fi";

import "../styles/help.css";

const faqData = [
  {
    question: "What is Chronic AI?",
    answer:
      "Chronic AI is your intelligent AI assistant for writing, learning, coding, research and everyday tasks.",
  },
  {
    question: "How do I start a new conversation?",
    answer:
      'Click the "New Chat" button from the sidebar. A fresh conversation will be created instantly.',
  },
  {
    question: "Can I upload documents?",
    answer:
      "Yes. You can attach supported documents from the prompt area and ask Chronic AI questions about their content.",
  },
  {
    question: "Can I upload images?",
    answer:
      "Yes. Use the image attachment option in the prompt bar to send an image along with your question.",
  },
  {
    question: "How do I change the appearance?",
    answer:
      "Open Settings and use the Appearance section to customize the look and feel of Chronic AI.",
  },
  {
    question: "Where can I find my previous chats?",
    answer:
      "Your conversations appear in the Chat History section of the sidebar.",
  },
];

const categories = [
  {
    icon: <FiZap />,
    title: "Getting Started",
    text: "Learn the basics and start using Chronic AI.",
  },
  {
    icon: <FiMessageCircle />,
    title: "Chats & Conversations",
    text: "Learn how chats, history and messages work.",
  },
  {
    icon: <FiBookOpen />,
    title: "Features",
    text: "Explore documents, images, coding and research.",
  },
  {
    icon: <FiShield />,
    title: "Privacy & Settings",
    text: "Manage your preferences and application settings.",
  },
];

export default function Help() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const filteredFaqs = faqData.filter((item) => {
    const query = search.toLowerCase();

    return (
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query)
    );
  });

  return (
    <main className="helpPage">

      {/* =========================
          HERO
      ========================= */}

      <section className="helpHero">

        <div className="helpHeroIcon">
          <FiHelpCircle size={30} />
        </div>

        <div className="helpHeroContent">
          <span className="helpEyebrow">
            CHRONIC AI SUPPORT
          </span>

          <h1>
            How can we
            <span> help you?</span>
          </h1>

          <p>
            Find answers, explore features and learn
            how to get the most out of Chronic AI.
          </p>
        </div>

      </section>


      {/* =========================
          SEARCH
      ========================= */}

      <section className="helpSearchSection">

        <div className="helpSearchBox">

          <FiSearch size={20} />

          <input
            type="text"
            placeholder="Search for help..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="helpSearchClear"
            >
              ×
            </button>
          )}

        </div>

      </section>


      {/* =========================
          QUICK HELP CATEGORIES
      ========================= */}

      {!search && (
        <section className="helpSection">

          <div className="helpSectionHeading">
            <div>
              <span>EXPLORE</span>
              <h2>Help Center</h2>
            </div>

            <p>
              Everything you need to know about Chronic AI.
            </p>
          </div>


          <div className="helpCategoryGrid">

            {categories.map((category) => (
              <button
                className="helpCategoryCard"
                key={category.title}
                type="button"
              >

                <div className="helpCategoryIcon">
                  {category.icon}
                </div>

                <div className="helpCategoryText">
                  <h3>{category.title}</h3>

                  <p>{category.text}</p>
                </div>

                <FiExternalLink
                  className="helpCategoryArrow"
                  size={15}
                />

              </button>
            ))}

          </div>

        </section>
      )}


      {/* =========================
          FAQ
      ========================= */}

      <section className="helpSection faqSection">

        <div className="helpSectionHeading">

          <div>
            <span>FAQ</span>
            <h2>
              Frequently Asked Questions
            </h2>
          </div>

          <p>
            Quick answers to common questions.
          </p>

        </div>


        <div className="faqList">

          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((item, index) => {

              const isOpen = openFaq === index;

              return (
                <div
                  className={`faqItem ${
                    isOpen ? "faqOpen" : ""
                  }`}
                  key={item.question}
                >

                  <button
                    type="button"
                    className="faqQuestion"
                    onClick={() =>
                      setOpenFaq(
                        isOpen ? null : index
                      )
                    }
                  >

                    <span>
                      {item.question}
                    </span>

                    <FiChevronDown
                      size={18}
                      className={
                        isOpen
                          ? "faqChevronOpen"
                          : ""
                      }
                    />

                  </button>


                  {isOpen && (
                    <div className="faqAnswer">
                      {item.answer}
                    </div>
                  )}

                </div>
              );
            })
          ) : (
            <div className="helpNoResults">

              <FiSearch size={25} />

              <h3>
                No results found
              </h3>

              <p>
                Try searching with a different keyword.
              </p>

            </div>
          )}

        </div>

      </section>


      {/* =========================
          CONTACT SUPPORT
      ========================= */}

      <section className="helpSupport">

        <div className="helpSupportIcon">
          <FiMessageCircle size={24} />
        </div>

        <div className="helpSupportText">

          <span>STILL NEED HELP?</span>

          <h2>
            We're here for you.
          </h2>

          <p>
            Couldn't find what you were looking for?
            Get in touch with support.
          </p>

        </div>

        <button
          type="button"
          className="helpContactBtn"
        >
          <FiMail size={16} />
          Contact Support
        </button>

      </section>


      {/* =========================
          FOOTER
      ========================= */}

      <div className="helpFooter">

        <span>
          Chronic AI Help Center
        </span>

        <span>
          Built for smarter conversations.
        </span>

      </div>

    </main>
  );
}