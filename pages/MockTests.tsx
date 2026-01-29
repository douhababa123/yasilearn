import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Headphones, FileText, PenTool, Mic, Clock, Play, ArrowRight, FolderOpen, Loader2, CheckCircle } from 'lucide-react';

interface Test {
  id: number;
  name: string;
  pdf_path: string;
  created_at: string;
  has_listening: boolean;
  has_reading: boolean;
  has_writing: boolean;
  has_speaking: boolean;
}

export const MockTests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'listening' | 'reading' | 'writing' | 'speaking'>('all');

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const response = await fetch('/api/tests');
      const data = await response.json();

      // Check for parsed data for each test
      const testsWithStatus = await Promise.all(data.map(async (test: any) => {
        try {
          // Check if this test has parsed listening questions
          const listeningRes = await fetch(`/api/listening/${test.id}`);
          const hasListening = listeningRes.ok;

          // Check if has reading
          const readingRes = await fetch(`/api/reading/${test.id}`);
          const hasReading = readingRes.ok;

          // Check if has writing
          const writingRes = await fetch(`/api/writing/${test.id}`);
          const hasWriting = writingRes.ok;

          // Check if has speaking
          const speakingRes = await fetch(`/api/speaking/${test.id}`);
          const hasSpeaking = speakingRes.ok;

          return {
            ...test,
            has_listening: hasListening,
            has_reading: hasReading,
            has_writing: hasWriting,
            has_speaking: hasSpeaking
          };
        } catch (e) {
          return {
            ...test,
            has_listening: false,
            has_reading: false,
            has_writing: false,
            has_speaking: false
          };
        }
      }));

      setTests(testsWithStatus);
    } catch (err) {
      console.error('Failed to load tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test => {
    if (filter === 'all') return true;
    return (test as any)[`has_${filter}`];
  });

  const getTestTypeIcon = (test: Test) => {
    const types = [];
    if (test.has_listening) types.push(<Headphones key="listening" size={16} className="text-blue-500" />);
    if (test.has_reading) types.push(<BookOpen key="reading" size={16} className="text-green-500" />);
    if (test.has_writing) types.push(<PenTool key="writing" size={16} className="text-purple-500" />);
    if (test.has_speaking) types.push(<Mic key="speaking" size={16} className="text-orange-500" />);
    return types;
  };

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <BookOpen className="text-primary" size={32} />
          Mock Tests
        </h1>
        <p className="text-slate-500 max-w-2xl">
          Practice IELTS with real test materials. Choose a test and start your practice session.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All Tests', icon: FolderOpen },
          { key: 'listening', label: 'Listening', icon: Headphones },
          { key: 'reading', label: 'Reading', icon: BookOpen },
          { key: 'writing', label: 'Writing', icon: PenTool },
          { key: 'speaking', label: 'Speaking', icon: Mic },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
              filter === tab.key
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      )}

      {/* Tests Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200">
              <FolderOpen size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">No tests found for this category.</p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Upload Test Materials
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            filteredTests.map(test => (
              <div
                key={test.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{test.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Clock size={14} />
                        {new Date(test.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {getTestTypeIcon(test)}
                    </div>
                  </div>

                  {/* Available Sections */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {test.has_listening && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        Listening
                      </span>
                    )}
                    {test.has_reading && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                        Reading
                      </span>
                    )}
                    {test.has_writing && (
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                        Writing
                      </span>
                    )}
                    {test.has_speaking && (
                      <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-medium">
                        Speaking
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/mock-tests/${test.id}`}
                      className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                    >
                      <Play size={16} />
                      Start Test
                    </Link>
                    <a
                      href={test.pdf_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <FileText size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-500" />
          Test Tips
        </h3>
        <ul className="text-slate-600 space-y-2 text-sm">
          <li>• Complete listening and reading tests in one sitting (60-80 minutes)</li>
          <li>• Writing tasks should be timed: Task 1 (20 min) and Task 2 (40 min)</li>
          <li>• Speaking tests are conducted with an examiner and last 11-14 minutes</li>
          <li>• Review your answers and understand your mistakes for improvement</li>
        </ul>
      </div>
    </div>
  );
};
