import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSettings, FiSend } from "react-icons/fi";
import ModelDropdown from "../components/ModelDropdown";
import { type Chat, type ChatModel } from "../types/Chat";
import "../ChatScreen.css";
import chatIcon from "../assets/Mlab-imgs/favicon.ico";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { sendChat } from "../redux/chatSlice";
import MarkdownPreview from "@uiw/react-markdown-preview";

type Message = {
  sender: "user" | "bot";
  text: string;
  duration?: string; // Optional field to display response time for bot messages
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello  How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ChatModel>("stepfun");
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const { currentChat, chats } = useSelector((state: RootState) => state.chats); // Placeholder for future chat-related state
  const dispatch = useDispatch<AppDispatch>(); // Placeholder for future dispatching of chat actions
  const navigate = useNavigate();

  useEffect(() => {
    setMessages((prev) => {
      if (currentChat) {
        const botMsg: Message = {
          sender: "bot",
          text: currentChat.answer,
          duration: currentChat.duration, // Display response time if available
        };
        return [...prev, botMsg];
      }
      return prev;
    });
    setIsThinking(false);
  }, [currentChat, chats]); // Placeholder for future side effects related to chat state changes

  const handleSend = () => {
    if (!input.trim() || isThinking) return;

    const payload: Chat = {
      query: input.trim(),
      modelType: model,
    };

    setMessages((prev) => [...prev, { sender: "user", text: input.trim() }]);
    setInput("");
    setIsThinking(true);
    // call thunk to send chat to backend
    dispatch(sendChat(payload));
  }; //  ChatGPT-style "first open" empty state:
  // show centered greeting ONLY when there are no user messages yet

  const isEmptyState = messages.every((m) => m.sender !== "user");

  return (
    <>
      {!isOpen && (
        <button className="chat-btn-floating" onClick={() => setIsOpen(true)}>
          <img src={chatIcon} alt="Chat" width={40} height={40} />
        </button>
      )}

   <div className={`chat-popup ${isOpen ? "open" : ""}`}>

          {/* HEADER */}

          <div className="chat-header">
            <div className="chat-header-left">
              <span className="model">Choose a model</span>

              <div className="model-btn">
                <ModelDropdown model={model} setModel={setModel} />
              </div>
            </div>

            <div className="chat-header-right">
              <button
                className="nav-btn"
                onClick={() => navigate("/admin")}
                title="Admin Settings"
              >
                <FiSettings size={18} />
              </button>

              <button
                className="chat-close-btn"
                onClick={() => setIsOpen(false)}
              >
                <span className="close-icon">✕</span>
              </button>
            </div>
          </div>
          {/* BODY */}

          <div className="chat-screen">
            <div className="chat-body">
              {isEmptyState ? (
                <div className="chat-empty-state">
                  <img src={chatIcon} alt="AI" className="empty-ai-icon" />
                  <h2>Hi </h2>
                  <p>How can I help you today?</p>
                </div>
              ) : (
                <>
                  {messages.map((ms, index) => (
                    <div key={index} className={`chat-bubble ${ms.sender}`}>
                      <div>
                        <MarkdownPreview source={ms.text} />
                      </div>

                    
                      {ms.sender === "bot" && (
                        <span className="response-time">
                          Responded in {ms.duration ? ms.duration : 0}
                        </span>
                      )}
                    </div>
                  ))}

                  {isThinking && (
                    <div className="chat-bubble bot thinking">
                      <img src={chatIcon} alt="AI" width={18} />

                      <span>
                        Thinking
                        <span className="dots"></span>
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            {/* INPUT (Gemini-style pill) */}

            <div className="chat-footer">
              <div
                className={`chat-input-pill ${isThinking ? "disabled" : ""}`}
              >
                <input
                  type="text"
                  placeholder="Ask Tribal Librarian…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={isThinking}
                />
                <div className="pill-right">
                  {/* Model Dropdown */}

                  {/* Send icon */}

                  <button
                    className="send-icon-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                    aria-label="Send message"
                    title="Send"
                  >
                    <FiSend size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
