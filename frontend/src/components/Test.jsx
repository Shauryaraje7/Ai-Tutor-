import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Test.css';

function Test() {
  const [questions, setQuestions] = useState({});
  const [userAnswers, setUserAnswers] = useState({ easy: '', medium: '', hard: '' });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { topic, classStandard } = location.state || {};

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://localhost:5000/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, classStandard, userId: 'default_user' }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    if (topic && classStandard) {
      fetchQuestions();
    }
  }, [topic, classStandard]);

  const handleAttend = (level) => {
    setCurrentQuestion(level);
  };

  const handleAnswerChange = (e) => {
    setUserAnswers({ ...userAnswers, [currentQuestion]: e.target.value });
  };

  const handleSubmitAnswer = () => {
    setCurrentQuestion(null);
  };

  const handleSubmitTest = async () => {
    try {
      const response = await fetch('http://localhost:5000/evaluate-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default_user',
          userAnswers,
          correctAnswers: questions,
          topic,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      alert(`Score: ${data.score}/6\nFeedback:\nEasy: ${data.feedback.easy}\nMedium: ${data.feedback.medium}\nHard: ${data.feedback.hard}`);
      navigate('/');
    } catch (error) {
      console.error('Error evaluating answers:', error);
      alert('Error evaluating answers.');
    }
  };

  return (
    <div className="test">
      <h1>Test: {topic || 'Topic name'}</h1>
      <div className="questions">
        {['easy', 'medium', 'hard'].map((level) => (
          <div key={level} className="question">
            <span className="question-number">{level === 'easy' ? 1 : level === 'medium' ? 2 : 3}</span>
            <p>{questions[level]?.question || 'Loading...'}</p>
            <button className="attend-btn" onClick={() => handleAttend(level)}>Attend</button>
          </div>
        ))}
      </div>
      {currentQuestion && (
        <div className="answer-modal">
          <h2>{currentQuestion.charAt(0).toUpperCase() + currentQuestion.slice(1)} Question</h2>
          <p>{questions[currentQuestion]?.question}</p>
          <textarea
            value={userAnswers[currentQuestion]}
            onChange={handleAnswerChange}
            placeholder="Type your answer here..."
          />
          <button onClick={handleSubmitAnswer}>Submit Answer</button>
        </div>
      )}
      <div className="actions">
        <button className="cancel-btn" onClick={() => navigate('/')}>Cancel</button>
        <button className="submit-btn" onClick={handleSubmitTest}>Submit</button>
      </div>
    </div>
  );
}

export default Test;