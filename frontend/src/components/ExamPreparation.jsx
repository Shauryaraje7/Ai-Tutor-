import { useState, useEffect } from 'react';
import '../styles/ExamPreparation.css';

function ExamPreparation() {
  const [examDate, setExamDate] = useState('');
  const [courseName, setCourseName] = useState('');
  const [daysLeft, setDaysLeft] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [progress, setProgress] = useState({ topicsStudied: 0, totalTopics: 0 });
  const [reminders, setReminders] = useState([]);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [quizCourseName, setQuizCourseName] = useState('');

  const calculateDaysLeft = (date) => {
    const today = new Date();
    const exam = new Date(date);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-exam-prep-progress?userId=default_user');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSchedule(data.schedule || []);
      setProgress(data.progress);
      setReminders(data.reminders);
      setMotivationalMessage(data.motivationalMessage);
      if (data.schedule && data.schedule.length > 0) {
        setCourseName(data.courseName || '');
        setDaysLeft(data.daysLeft || 0);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleGenerateSchedule = async () => {
    if (!examDate || !courseName) {
      alert('Please enter both exam date and course name.');
      return;
    }

    const days = calculateDaysLeft(examDate);
    setDaysLeft(days);

    try {
      const response = await fetch('http://localhost:5000/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default_user',
          courseName,
          daysLeft: days,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSchedule(data.schedule);
      fetchProgress(); // Refresh progress and reminders
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Error generating schedule: ' + (error.message || 'Unknown error'));
    }
  };

  const handleMarkStudied = async (day, topic) => {
    try {
      const response = await fetch('http://localhost:5000/mark-topic-studied', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default_user',
          day,
          topic,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      fetchProgress(); // Refresh progress and reminders
    } catch (error) {
      console.error('Error marking topic as studied:', error);
      alert('Error marking topic as studied: ' + (error.message || 'Unknown error'));
    }
  };

  const handleStartQuiz = async () => {
    if (!schedule.length) {
      alert('Please generate a study schedule before starting the quiz.');
      return;
    }

    // Fetch the latest schedule to ensure it exists
    let fetchedCourseName = '';
    try {
      const response = await fetch('http://localhost:5000/get-exam-prep-progress?userId=default_user');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (!data.schedule || data.schedule.length === 0) {
        alert('No schedule found. Please generate a schedule first.');
        return;
      }
      setSchedule(data.schedule);
      // Get the courseName from the fetched schedule (top-level field)
      fetchedCourseName = data.courseName || '';
      setCourseName(fetchedCourseName); // Update state for UI purposes
      setQuizCourseName(fetchedCourseName); // Store for quiz usage
      if (!fetchedCourseName) {
        alert('Course name not found in schedule. Please generate a schedule with a valid course name.');
        return;
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      alert('Error fetching schedule: ' + (error.message || 'Unknown error'));
      return;
    }

    setQuizStarted(true);
    try {
      console.log('Sending request to /generate-exam-quiz with courseName:', fetchedCourseName);
      const response = await fetch('http://localhost:5000/generate-exam-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default_user',
          courseName: fetchedCourseName,
        }),
      });
      const data = await response.json();
      console.log('Response from /generate-exam-quiz:', data);
      if (data.error) throw new Error(data.error);
      setQuizQuestions(data.questions || []);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Error generating quiz: ' + (error.message || 'Unknown error'));
      setQuizStarted(false); // Reset quiz state on error
    }
  };

  const handleAnswerChange = (qid, answer) => {
    setUserAnswers({ ...userAnswers, [qid]: answer });
  };

  const handleSubmitQuiz = async () => {
    try {
      // Validate inputs before sending the request
      if (!quizCourseName) {
        throw new Error('Course name is missing. Please restart the quiz.');
      }
      if (!Object.keys(userAnswers).length) {
        throw new Error('No answers provided. Please answer at least one question.');
      }
      if (!quizQuestions.length) {
        throw new Error('No quiz questions available. Please restart the quiz.');
      }

      const correctAnswers = quizQuestions.reduce((acc, q) => {
        acc[q.id] = { answer: q.answer, topic: q.topic };
        return acc;
      }, {});

      console.log('Submitting quiz with data:', {
        userId: 'default_user',
        courseName: quizCourseName,
        userAnswers,
        correctAnswers,
      });

      const response = await fetch('http://localhost:5000/evaluate-exam-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default_user',
          courseName: quizCourseName,
          userAnswers,
          correctAnswers,
        }),
      });

      const data = await response.json();
      console.log('Response from /evaluate-exam-quiz:', data);

      if (data.error) throw new Error(data.error);
      setQuizResults(data);
    } catch (error) {
      console.error('Error evaluating quiz:', error);
      alert('Error evaluating quiz: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="exam-preparation">
      <h1>Exam Preparation</h1>
      {!schedule.length && !quizStarted && !quizResults && (
        <div className="input-section">
          <div className="input-group">
            <label>Exam Date:</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="input-group">
            <label>Course Name:</label>
            <input
              type="text"
              placeholder="e.g., Engineering Physics"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>
          <button className="generate-btn" onClick={handleGenerateSchedule}>
            Generate Schedule
          </button>
        </div>
      )}
      {schedule.length > 0 && !quizStarted && !quizResults && (
        <div className="schedule-section">
          <h2>Study Schedule ({daysLeft} Days Left)</h2>
          {reminders.length > 0 && (
            <div className="reminders">
              <h3>Today's Reminders</h3>
              {reminders.map((reminder, index) => (
                <p key={index}>{reminder.message}</p>
              ))}
            </div>
          )}
          <p className="motivational-message">{motivationalMessage}</p>
          <p>Progress: {progress.topicsStudied}/{progress.totalTopics} topics studied</p>
          {schedule.map((day, index) => (
            <div key={index} className="day-schedule">
              <h3>{day.day}</h3>
              {day.topics.map((topic, idx) => (
                <div key={idx} className="topic">
                  <p><strong>Topic:</strong> {topic.name}</p>
                  <p>
                    <strong>Video Lecture:</strong>{' '}
                    <a href={topic.video.url} target="_blank" rel="noopener noreferrer">
                      {topic.video.title}
                    </a>
                  </p>
                  <button
                    className="studied-btn"
                    onClick={() => handleMarkStudied(day.day, topic.name)}
                    disabled={topic.studied}
                  >
                    {topic.studied ? 'Studied' : 'Mark as Studied'}
                  </button>
                </div>
              ))}
            </div>
          ))}
          <button className="quiz-btn" onClick={handleStartQuiz}>
            Start Final Quiz
          </button>
        </div>
      )}
      {quizStarted && !quizResults && (
        <div className="quiz-section">
          <h2>Final Quiz (25 Questions)</h2>
          {quizQuestions.length === 0 ? (
            <p>Loading questions...</p>
          ) : (
            quizQuestions.map((q) => (
              <div key={q.id} className="quiz-question">
                <p><strong>Question {q.id}:</strong> {q.question}</p>
                <p><strong>Topic:</strong> {q.topic}</p>
                <textarea
                  value={userAnswers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                />
              </div>
            ))
          )}
          <button className="submit-quiz-btn" onClick={handleSubmitQuiz} disabled={quizQuestions.length === 0}>
            Submit Quiz
          </button>
        </div>
      )}
      {quizResults && (
        <div className="results-section">
          <h2>Quiz Results</h2>
          <p><strong>Score:</strong> {quizResults.score}/{quizResults.total}</p>
          <p><strong>Percentage:</strong> {quizResults.percentage}%</p>
          <h3>Performance Analysis</h3>
          <p><strong>Strong Topics:</strong> {quizResults.analysis.strong.join(', ') || 'None'}</p>
          <p><strong>Medium Topics:</strong> {quizResults.analysis.medium.join(', ') || 'None'}</p>
          <p><strong>Weak Topics:</strong> {quizResults.analysis.weak.join(', ') || 'None'}</p>
          <button
            className="restart-btn"
            onClick={() => {
              setSchedule([]);
              setQuizStarted(false);
              setQuizResults(null);
              setQuizQuestions([]);
              setUserAnswers({});
              setQuizCourseName('');
              fetchProgress();
            }}
          >
            Prepare for Another Exam
          </button>
        </div>
      )}
    </div>
  );
}

export default ExamPreparation;