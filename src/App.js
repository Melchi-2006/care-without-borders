import "./App.css";

function App() {
  return (
    <div>
      <div className="navbar">
        <h1>Care Without Borders</h1>
      </div>

      <div className="container">

        <div className="card">
          <h2>Book Appointment</h2>
          <input type="date" />
          <button>Book</button>
        </div>

        <div className="card">
          <h2>Instant Video Consultation</h2>
          <input type="text" placeholder="Enter Room Name" />
          <button>Start Call</button>
        </div>

        <div className="card">
          <h2>AI Medical Chatbot</h2>
          <input type="text" placeholder="Ask your medical question..." />
          <button>Send</button>
        </div>

      </div>
    </div>
  );
}

export default App;