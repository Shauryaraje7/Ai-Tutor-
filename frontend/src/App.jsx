import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import Profile from './components/Profile';
import Progress from './components/Progress';
import Test from './components/Test';
import ExamPreparation from './components/ExamPreparation'; // New import
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <Sidebar />
        {/* Main Content */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<MainPanel />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/test" element={<Test />} />
            <Route path="/exam-preparation" element={<ExamPreparation />} /> {/* New route */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;