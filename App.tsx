import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SpeakingSession } from './pages/SpeakingSession';
import { SpeakingResult } from './pages/SpeakingResult';
import { WritingSession } from './pages/WritingSession';
import { WritingResult } from './pages/WritingResult';
import { ListeningTest } from './pages/ListeningTest';
import { ReadingTest } from './pages/ReadingTest';
import { MockResult } from './pages/MockResult';
import { Vocabulary } from './pages/Vocabulary';
import { ErrorBank } from './pages/ErrorBank';
import { Achievement } from './pages/Achievement';
import { DataImport } from './pages/DataImport';
import { UploadPage } from './pages/Upload';
import { MockTests } from './pages/MockTests';
import { MockTestSession } from './pages/MockTestSession';
import { StudyPlan } from './pages/StudyPlan';
import { DatabaseViewer } from './pages/DatabaseViewer';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vocabulary" element={<Vocabulary />} />
          <Route path="error-bank" element={<ErrorBank />} />
          <Route path="community" element={<Achievement />} />
          <Route path="settings" element={<DataImport />} />
          <Route path="upload" element={<UploadPage />} /> {/* Using Settings as Data Import for Demo */}
          <Route path="mock-tests" element={<MockTests />} />
          <Route path="mock-tests/:testId" element={<MockTestSession />} />
          <Route path="study-plan" element={<StudyPlan />} />
          <Route path="database" element={<DatabaseViewer />} />
        </Route>
        
        {/* Full screen experiences without Sidebar */}
        <Route path="/speaking" element={<SpeakingSession />} />
        <Route path="/speaking/result" element={<SpeakingResult />} />
        <Route path="/writing" element={<WritingSession />} />
        <Route path="/writing/result" element={<WritingResult />} />
        <Route path="/listening" element={<ListeningTest />} />
        <Route path="/mock-tests/4/result" element={<MockResult />} />

        {/* Mock Test Sections - with testId */}
        <Route path="/mock-tests/:testId/listening" element={<ListeningTest />} />
        <Route path="/mock-tests/:testId/reading" element={<ReadingTest />} />
        <Route path="/mock-tests/:testId/writing" element={<WritingSession />} />
        <Route path="/mock-tests/:testId/speaking" element={<SpeakingSession />} />
        
        {/* Catch all redirect to dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
