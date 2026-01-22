import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SpeakingSession } from './pages/SpeakingSession';
import { SpeakingResult } from './pages/SpeakingResult';
import { WritingSession } from './pages/WritingSession';
import { WritingResult } from './pages/WritingResult';
import { ListeningTest } from './pages/ListeningTest';
import { MockResult } from './pages/MockResult';
import { Vocabulary } from './pages/Vocabulary';
import { ErrorBank } from './pages/ErrorBank';
import { Achievement } from './pages/Achievement';
import { DataImport } from './pages/DataImport';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vocabulary" element={<Vocabulary />} />
          <Route path="error-bank" element={<ErrorBank />} />
          <Route path="community" element={<Achievement />} />
          <Route path="settings" element={<DataImport />} /> {/* Using Settings as Data Import for Demo */}
        </Route>
        
        {/* Full screen experiences without Sidebar */}
        <Route path="/speaking" element={<SpeakingSession />} />
        <Route path="/speaking/result" element={<SpeakingResult />} />
        <Route path="/writing" element={<WritingSession />} />
        <Route path="/writing/result" element={<WritingResult />} />
        <Route path="/listening" element={<ListeningTest />} />
        <Route path="/mock-tests/4/result" element={<MockResult />} />
        
        {/* Catch all redirect to dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
