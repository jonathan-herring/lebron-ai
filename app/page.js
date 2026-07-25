"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowUp,
  Crown,
  Film,
  Trophy,
  Github,
  Menu,
  Plus,
  RotateCcw,
  Sparkles,
  UtensilsCrossed,
  X,
} from "lucide-react";

const welcomeMessage = {
  role: "assistant",
  content:
    "What are we getting into today? Bring me a question, a tough decision, or just something you want to talk through.",
};

const prompts = [
  { label: "Settle a GOAT debate", icon: Crown },
  { label: "It’s Taco Tuesday. What are we making?", icon: UtensilsCrossed },
  { label: "Give me a movie pick", icon: Film },
];

export default function Home() {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const newChat = () => {
    setMessages([welcomeMessage]);
    setMessage("");
    setError("");
    setMenuOpen(false);
  };

  const sendMessage = async (event, prompt = message) => {
    event?.preventDefault();
    const content = prompt.trim();
    if (!content || isSending) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setMessage("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const responseType = response.headers.get("content-type") || "";
      const result = responseType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        throw new Error(
          result?.error ||
            `The chat endpoint returned ${response.status}. Check that LeBron AI is running on this address.`,
        );
      }

      if (!result?.content) {
        throw new Error("The chat endpoint returned an unexpected response.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.content },
      ]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="app-shell">
      {menuOpen && (
        <button
          className="scrim"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><Trophy size={21} /></div>
          <div>
            <strong>LEBRON AI</strong>
            <span>Built for the next play</span>
          </div>
          <button className="icon-button close-menu" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <button className="new-chat" onClick={newChat}>
          <Plus size={18} /> New conversation
        </button>

        <div className="sidebar-status">
          <span className="status-dot" />
          <div>
            <strong>COACH IS IN</strong>
            <span>Powered by Groq</span>
          </div>
        </div>

        <div className="culture-tags" aria-label="LeBron culture">
          <span>AKRON MADE</span>
          <span><Crown size={11} /> YEAR 23</span>
          <span>MORE THAN AN ATHLETE</span>
        </div>

        <div className="sidebar-motto">
          <span>STRIVE FOR</span>
          <strong>GREATNESS</strong>
          <p>Every possession is another chance to get better.</p>
        </div>

        <a className="github-link" href="https://github.com/jonathan-herring/lebron-ai" target="_blank" rel="noreferrer">
          <Github size={18} /> View on GitHub
        </a>
      </aside>

      <section className="chat-panel">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={21} />
          </button>
          <div className="coach-status">
            <div className="avatar"><span>23</span></div>
            <div>
              <strong>LeBron AI</strong>
              <span>UNOFFICIAL FAN EXPERIENCE</span>
            </div>
          </div>
          <button className="icon-button" onClick={newChat} aria-label="Reset conversation" title="Reset conversation">
            <RotateCcw size={19} />
          </button>
        </header>

        <div className="conversation">
          <div className="lebron-backdrop" aria-hidden="true">
            <Image
              src="/lebron-poster-dunk.png"
              alt=""
              fill
              sizes="(max-width: 760px) 100vw, calc(100vw - 272px)"
              priority
            />
          </div>
          <div className="taco-callout" aria-hidden="true">
            <UtensilsCrossed size={17} />
            <span>TUESDAY MODE</span>
            <strong>TACOS ON DECK</strong>
          </div>
          <div className="conversation-inner">
            <div className="intro">
              <span className="intro-icon"><Sparkles size={19} /></span>
              <p>THE FLOOR IS YOURS</p>
              <h1>What&apos;s on your mind?</h1>
            </div>

            <div className="messages" aria-live="polite">
              {messages.map((item, index) => (
                <div className={`message-row ${item.role}`} key={`${item.role}-${index}`}>
                  {item.role === "assistant" && <div className="message-avatar">23</div>}
                  <div className="message-content">
                    <span>{item.role === "assistant" ? "COACH LEBRON" : "YOU"}</span>
                    <p>{item.content}</p>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="message-row assistant">
                  <div className="message-avatar">23</div>
                  <div className="message-content">
                    <span>COACH LEBRON</span>
                    <div className="typing" aria-label="LeBron AI is thinking"><i /><i /><i /></div>
                  </div>
                </div>
              )}
              {error && (
                <div className="error-message" role="alert">
                  <strong>Possession lost.</strong> {error}
                  <button onClick={(event) => sendMessage(event, messages.at(-1)?.content || "")}>Try again</button>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {messages.length === 1 && (
              <div className="prompt-row">
                {prompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={(event) => sendMessage(event, prompt.label)}
                  >
                    <prompt.icon size={14} />
                    {prompt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="composer-wrap">
          <form className="composer" onSubmit={sendMessage}>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) sendMessage(event);
              }}
              placeholder="Ask for advice, strategy, or a new perspective..."
              aria-label="Message Coach LeBron"
              rows={1}
              maxLength={2000}
            />
            <button type="submit" disabled={!message.trim() || isSending} aria-label="Send message">
              <ArrowUp size={21} />
            </button>
          </form>
          <p>AI can make mistakes. Greatness still requires your judgment.</p>
        </div>
      </section>
    </main>
  );
}
