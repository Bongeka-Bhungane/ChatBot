import { useState } from "react";
import ModelDropdown, { type ChatModel } from "../components/ModelDropdown";
import "../ChatScreen.css";

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "bot", text: "Hello 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<ChatModel>("GPT-4");
  const [isOpen, setIsOpen] = useState(false); // popup state

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const botMsg: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: `(${model}) AI response placeholder...`,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 700);
  };

  return (
    <>
      {/* Chat Button (to open popup) */}
      {!isOpen && (
        <button className="chat-btn-floating" onClick={() => setIsOpen(true)}>
          💬 
        </button>
      )}

      {/* Chat Popup */}
      {isOpen && (
        <div className="chat-popup">
          <div className="chat-header">
            <span>Chatbot</span>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              ✖
            </button>
          </div>

          <div className="chat-screen">
            <div className="chat-body">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="chat-footer">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend}>➤</button>
            </div>

            <div className="model-selector">
              <ModelDropdown model={model} setModel={setModel} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
