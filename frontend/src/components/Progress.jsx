import { useState, useEffect } from 'react';
import '../styles/Progress.css';

function Progress() {
  const [tab, setTab] = useState('overall');
  const [overallProgress, setOverallProgress] = useState({ percentage: 0 });
  const [history, setHistory] = useState([]);
  const [topicReport, setTopicReport] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (tab === 'overall') {
        const response = await fetch('http://localhost:5000/get-overall-progress?userId=default_user');
        const data = await response.json();
        setOverallProgress(data);
      } else if (tab === 'history') {
        const response = await fetch('http://localhost:5000/get-learning-history?userId=default_user');
        const data = await response.json();
        setHistory(data.history || []);
      } else if (tab === 'topic') {
        const response = await fetch('http://localhost:5000/get-topic-wise-report?userId=default_user');
        const data = await response.json();
        setTopicReport(data.report || {});
      }
    };
    fetchData();
  }, [tab]);

  return (
    <div className="progress">
      <h1>Progress</h1>
      <div className="tabs">
        <button className={`tab ${tab === 'overall' ? 'active' : ''}`} onClick={() => setTab('overall')}>
          Overall progress
        </button>
        <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          Learning history
        </button>
        <button className={`tab ${tab === 'topic' ? 'active' : ''}`} onClick={() => setTab('topic')}>
          Topic wise report
        </button>
      </div>
      <div className="progress-content">
        {tab === 'overall' && (
          <div>
            <h2>Overall Progress</h2>
            <p>Total Score: {overallProgress.totalScore}/{overallProgress.totalMaxScore}</p>
            <p>Percentage: {overallProgress.percentage}%</p>
          </div>
        )}
        {tab === 'history' && (
          <div>
            <h2>Learning History</h2>
            {history.length === 0 ? (
              <p>No history available.</p>
            ) : (
              history.map((entry, index) => (
                <div key={index} style={{ marginBottom: '16px' }}>
                  <p><strong>Topic:</strong> {entry.topic}</p>
                  <p><strong>Score:</strong> {entry.score}/{entry.maxScore}</p>
                  <p><strong>Date:</strong> {entry.date}</p>
                </div>
              ))
            )}
          </div>
        )}
        {tab === 'topic' && (
          <div>
            <h2>Topic-wise Report</h2>
            {Object.keys(topicReport).length === 0 ? (
              <p>No topic-wise data available.</p>
            ) : (
              Object.entries(topicReport).map(([topic, data]) => (
                <div key={topic} style={{ marginBottom: '16px' }}>
                  <p><strong>Topic:</strong> {topic}</p>
                  <p><strong>Total Score:</strong> {data.totalScore}/{data.totalMaxScore}</p>
                  <p><strong>Percentage:</strong> {data.percentage}%</p>
                  <p><strong>Tests Taken:</strong> {data.tests}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <button className="download-btn">Download report</button>
    </div>
  );
}

export default Progress;