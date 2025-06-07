import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MainPanel.css';

function MainPanel() {
  const [topic, setTopic] = useState('');
  const [classStandard, setClassStandard] = useState('');
  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState({ percentage: 0 });
  const [currentLesson, setCurrentLesson] = useState(null);
  const [doubt, setDoubt] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For loading animation
  const navigate = useNavigate();

  const fetchExplanation = async () => {
    try {
      const response = await fetch('http://localhost:5000/explain-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, classStandard, userId: 'default_user' }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setMessages([...messages, { type: 'received', text: data.explanation }]);
    } catch (error) {
      console.error('Error fetching explanation:', error);
      setMessages([...messages, { type: 'received', text: 'Error fetching explanation.' }]);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-overall-progress?userId=default_user');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const startLearning = async () => {
    if (!topic || !classStandard) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/start-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapter: topic, classStandard, userId: 'default_user' }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setCurrentLesson(data);
      setMessages([]);
    } catch (error) {
      console.error('Error starting lesson:', error);
      setMessages([...messages, { type: 'received', text: 'Error starting lesson.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async (isClear) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/next-subtopic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default_user', isClear }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.completed) {
        setMessages([...messages, { type: 'received', text: 'Chapter completed!' }]);
        setCurrentLesson(null);
        fetchProgress();
      } else {
        setCurrentLesson(data);
        setDoubt('');
      }
    } catch (error) {
      console.error('Error fetching next subtopic:', error);
      setMessages([...messages, { type: 'received', text: 'Error fetching next subtopic.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = async () => {
    setIsLoading(true);
    try {
      const currentIndex = currentLesson.current_index;
      if (currentIndex <= 0) return; // No previous topic
      const response = await fetch('http://localhost:5000/next-subtopic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default_user', isClear: true }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setCurrentLesson({
        ...data,
        current_index: currentIndex - 1, // Manually adjust index
        subtopic: users_data['default_user']['learning_session']['subtopics'][currentIndex - 1]
      });
      setDoubt('');
    } catch (error) {
      console.error('Error fetching previous subtopic:', error);
      setMessages([...messages, { type: 'received', text: 'Error fetching previous subtopic.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoubt = async () => {
    if (!doubt) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/resolve-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'default_user', doubt }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setCurrentLesson({ ...currentLesson, clarification: data.clarification });
    } catch (error) {
      console.error('Error resolving doubt:', error);
      setMessages([...messages, { type: 'received', text: 'Error resolving doubt.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    if (topic && classStandard) {
      fetchExplanation();
      fetchProgress();
    }
  };

  const handleTakeTest = () => {
    if (topic && classStandard) {
      navigate('/test', { state: { topic, classStandard } });
    }
  };

  const handleStartStructured = () => {
    if (topic && classStandard) {
      startLearning();
    }
  };

  return (
    <div className="main-panel">
      <h1>Learn with AI</h1>
      <div className="content">
        <div className="chat-section">
          <div className="chat-box">
            {isLoading ? (
              <div className="loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            ) : currentLesson ? (
              <div className="lesson-content">
                <h2 className="subtopic-title">{currentLesson.subtopic} (Step {currentLesson.current_index + 1}/{currentLesson.total_subtopics})</h2>
                <p className="explanation">{currentLesson.explanation}</p>
                <h3 className="questions-header">Practice Questions</h3>
                {currentLesson.questions.map((qa, idx) => (
                  <div key={idx} className="question-block">
                    <p><strong className="question-label">Q:</strong> {qa.question}</p>
                    <p><strong className="answer-label">A:</strong> {qa.answer}</p>
                  </div>
                ))}
                {currentLesson.clarification && (
                  <div className="clarification-block">
                    <h3 className="clarification-header">Clarification</h3>
                    <p>{currentLesson.clarification}</p>
                  </div>
                )}
                <div className="navigation-buttons">
                  <h3>Is everything clear?</h3>
                  {currentLesson.current_index > 0 && (
                    <button className="prev-btn" onClick={handlePrevious}>Previous Topic</button>
                  )}
                  <button className="next-btn" onClick={() => handleNext(true)}>Next Topic</button>
                  <textarea
                    className="doubt-input"
                    placeholder="Ask your doubt here..."
                    value={doubt}
                    onChange={(e) => setDoubt(e.target.value)}
                  />
                  <button className="doubt-btn" onClick={handleDoubt}>Submit Doubt</button>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`message ${msg.type}`}>
                  {msg.text}
                </div>
              ))
            )}
          </div>
          <div className="topic-input">
            <input
              type="text"
              placeholder="Enter Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <input
              type="text"
              placeholder="Class Standard (e.g., 10th)"
              value={classStandard}
              onChange={(e) => setClassStandard(e.target.value)}
            />
            <button className="start-btn" onClick={handleStart}>Quick Start</button>
            <button className="start-btn" onClick={handleStartStructured}>Structured Learning</button>
            <button className="menu-btn">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="status-section">
          <h2>Status</h2>
          <button className="take-test-btn" onClick={handleTakeTest}>Take Test</button>
          <h3>Progress</h3>
          <div className="progress-chart">
            <svg viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E6F3F3"
                strokeWidth="4"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#00C4B4"
                strokeWidth="4"
                strokeDasharray={`${progress.percentage}, 100`}
              />
            </svg>
            <span className="percentage">{progress.percentage}%</span>
          </div>
          <div className="progress-labels">
            <span className="right">Right {progress.percentage}%</span>
            <span className="wrong">Wrong {100 - progress.percentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPanel;