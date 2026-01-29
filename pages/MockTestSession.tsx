import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Play,
  Clock,
  CheckCircle,
  FileText,
  Loader2
} from 'lucide-react';

interface TestInfo {
  id: number;
  name: string;
  created_at: string;
}

interface SectionStatus {
  has_listening: boolean;
  has_reading: boolean;
  has_writing: boolean;
  has_speaking: boolean;
}

export const MockTestSession: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<TestInfo | null>(null);
  const [sections, setSections] = useState<SectionStatus>({
    has_listening: false,
    has_reading: false,
    has_writing: false,
    has_speaking: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestInfo();
  }, [testId]);

  const loadTestInfo = async () => {
    try {
      // Load test info
      const testRes = await fetch(`/api/tests/${testId}`);
      if (!testRes.ok) throw new Error('Test not found');
      const testData = await testRes.json();
      setTest(testData);

      // Check available sections
      const [listeningRes, readingRes, writingRes, speakingRes] = await Promise.all([
        fetch(`/api/listening/${testId}`),
        fetch(`/api/reading/${testId}`),
        fetch(`/api/writing/${testId}`),
        fetch(`/api/speaking/${testId}`)
      ]);

      setSections({
        has_listening: listeningRes.ok,
        has_reading: readingRes.ok,
        has_writing: writingRes.ok,
        has_speaking: speakingRes.ok
      });
    } catch (err) {
      console.error('Failed to load test:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <FileText size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-500">Test not found</p>
        <Link to="/mock-tests" className="mt-4 text-primary hover:underline">
          Back to Mock Tests
        </Link>
      </div>
    );
  }

  const availableSections = [
    { key: 'listening', label: 'Listening', icon: Headphones, color: 'blue', desc: '4 sections, 30+ minutes' },
    { key: 'reading', label: 'Reading', icon: BookOpen, color: 'green', desc: '3 passages, 60 minutes' },
    { key: 'writing', label: 'Writing', icon: PenTool, color: 'purple', desc: '2 tasks, 60 minutes' },
    { key: 'speaking', label: 'Speaking', icon: Mic, color: 'orange', desc: '3 parts, 11-14 minutes' }
  ].filter(section => sections[`has_${section.key}` as keyof SectionStatus]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/mock-tests"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Mock Tests
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">{test.name}</h1>
          <p className="text-slate-500 mt-1">Mock Test Session</p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Clock size={20} className="text-slate-400" />
            <span className="text-slate-600">
              Total time: <strong>~2.5 hours</strong> for full test
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSections.map(section => (
              <span
                key={section.key}
                className={`px-3 py-1 rounded-full text-sm font-medium bg-${section.color}-50 text-${section.color}-700`}
              >
                {section.label}
              </span>
            ))}
          </div>
        </div>

        {/* Section Cards */}
        {availableSections.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <FileText size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 mb-4">No test content available yet.</p>
            <p className="text-sm text-slate-400">
              Please parse the PDF first to generate test questions.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Upload
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableSections.map(section => (
              <div
                key={section.key}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-${section.color}-50`}>
                    <section.icon className={`text-${section.color}-600`} size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">{section.label}</h3>
                    <p className="text-sm text-slate-500 mt-1">{section.desc}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle size={16} />
                    <span>Ready</span>
                  </div>
                  <Link
                    to={`/mock-tests/${testId}/${section.key}`}
                    className={`px-4 py-2 bg-${section.color}-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-${section.color}-700 transition-colors`}
                  >
                    <Play size={16} />
                    Start
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-slate-100 rounded-xl p-6">
          <h3 className="font-bold text-slate-900 mb-3">Tips</h3>
          <ul className="text-slate-600 text-sm space-y-2">
            <li>• You can complete sections in any order or skip some</li>
            <li>• Listening and Reading are automatically scored</li>
            <li>• Writing and Speaking responses are evaluated by AI</li>
            <li>• Your progress is saved automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MockTestSession;
