import { useState } from "react";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = () => {
    if (!message) return;

    setChat([...chat, { user: message, system: "AI response here..." }]);
    setMessage("");
  };

  return (
    <div className="card">
      <h2>AI Medical Chatbot</h2>

      <div className="chat-box">
        {chat.map((c, index) => (
          <div key={index}>
            <p><b>You:</b> {c.user}</p>
            <p><b>System:</b> {c.system}</p>
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Ask your medical question..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chatbot;