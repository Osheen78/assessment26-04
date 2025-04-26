const { useState, useEffect } = React;

// Firebase URL (replace YOUR_DATABASE_URL)
const DATABASE_URL = "https://YOUR_DATABASE_URL.firebaseio.com/feedback.json";

// Components
function FeedbackForm({ onAddFeedback }) {
  const [form, setForm] = useState({ name: '', email: '', comment: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.comment) {
      setMessage('All fields are required.');
      return;
    }
    if (!validateEmail(form.email)) {
      setMessage('Please enter a valid email.');
      return;
    }

    const feedback = { ...form, timestamp: Date.now() };

    const response = await fetch(DATABASE_URL, {
      method: 'POST',
      body: JSON.stringify(feedback),
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      setForm({ name: '', email: '', comment: '' });
      setMessage('Feedback submitted!');
      onAddFeedback();
    } else {
      setMessage('Error submitting feedback.');
    }
  };

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <h2>Submit Feedback</h2>
      <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <textarea name="comment" placeholder="Comment" value={form.comment} onChange={handleChange}></textarea>
      <button type="submit">Submit</button>
      {message && <p className="message">{message}</p>}
    </form>
  );
}

function FeedbackItem({ id, feedback, onDelete }) {
  return (
    <div className="feedback-card">
      <h3>{feedback.name}</h3>
      <p>{feedback.comment}</p>
      <small>{feedback.email}</small>
      <button onClick={() => onDelete(id)}>Delete</button>
    </div>
  );
}

function FeedbackList({ feedbacks, onDelete }) {
  return (
    <div className="feedback-list">
      {Object.entries(feedbacks).map(([id, feedback]) => (
        <FeedbackItem key={id} id={id} feedback={feedback} onDelete={onDelete} />
      ))}
    </div>
  );
}

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
    </button>
  );
}

function App() {
  const [feedbacks, setFeedbacks] = useState({});
  const [theme, setTheme] = useState('light');

  const fetchFeedback = async () => {
    const res = await fetch(DATABASE_URL);
    const data = await res.json();
    setFeedbacks(data || {});
  };

  const deleteFeedback = async (id) => {
    await fetch(`https://YOUR_DATABASE_URL.firebaseio.com/feedback/${id}.json`, {
      method: 'DELETE'
    });
    fetchFeedback();
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.body.className = storedTheme;
  }, []);

  return (
    <div className="app">
      <header>
        <h1>Feedback Board</h1>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>
      <main>
        <FeedbackForm onAddFeedback={fetchFeedback} />
        <FeedbackList feedbacks={feedbacks} onDelete={deleteFeedback} />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);