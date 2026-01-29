import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Table, ChevronRight, ChevronDown, RefreshCw, Loader2, Sparkles } from 'lucide-react';

interface TestData {
  id: number;
  name: string;
  pdf_path: string;
  created_at: string;
}

interface ListeningData {
  id: number;
  section: number;
  questions: any[];
  audioTiming?: string;
}

interface ReadingData {
  id: number;
  passageNum: number;
  passage: string;
  questions: any[];
}

interface WritingData {
  id: number;
  task1_prompt: string;
  task2_prompt: string;
}

interface SpeakingData {
  id: number;
  cue_card: string;
  follow_up: any;
}

export const DatabaseViewer: React.FC = () => {
  const [tests, setTests] = useState<TestData[]>([]);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [listeningData, setListeningData] = useState<ListeningData[]>([]);
  const [readingData, setReadingData] = useState<ReadingData[]>([]);
  const [writingData, setWritingData] = useState<WritingData | null>(null);
  const [speakingData, setSpeakingData] = useState<SpeakingData[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [reparsing, setReparsing] = useState(false);
  const [parseMessage, setParseMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const reparseTest = async (testId: number) => {
    setReparsing(true);
    setParseMessage(null);

    try {
      const response = await fetch(`/api/tests/${testId}/parse`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setParseMessage({
          type: 'success',
          text: `Successfully re-parsed: ${result.parsedSections.listening} listening sections, ${result.parsedSections.reading} reading passages, ${result.parsedSections.speaking} speaking cards`
        });
        // Reload data
        await loadTestData(testId);
      } else if (result.error === 'scanned_pdf') {
        setParseMessage({
          type: 'error',
          text: result.message
        });
      } else {
        setParseMessage({
          type: 'error',
          text: result.error || 'Parse failed'
        });
      }
    } catch (err) {
      setParseMessage({
        type: 'error',
        text: 'Network error during parsing'
      });
    } finally {
      setReparsing(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const response = await fetch('/api/tests');
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error('Failed to load tests:', error);
    }
  };

  const loadTestData = async (testId: number) => {
    setLoading(true);
    setSelectedTest(testId);

    try {
      // Load listening
      try {
        const listeningRes = await fetch(`/api/listening/${testId}`);
        if (listeningRes.ok) {
          const data = await listeningRes.json();
          setListeningData(data);
        } else {
          setListeningData([]);
        }
      } catch {
        setListeningData([]);
      }

      // Load reading
      try {
        const readingRes = await fetch(`/api/reading/${testId}`);
        if (readingRes.ok) {
          const data = await readingRes.json();
          setReadingData(data);
        } else {
          setReadingData([]);
        }
      } catch {
        setReadingData([]);
      }

      // Load writing
      try {
        const writingRes = await fetch(`/api/writing/${testId}`);
        if (writingRes.ok) {
          const data = await writingRes.json();
          if (data.length > 0) {
            setWritingData(data[0]);
          } else {
            setWritingData(null);
          }
        } else {
          setWritingData(null);
        }
      } catch {
        setWritingData(null);
      }

      // Load speaking
      try {
        const speakingRes = await fetch(`/api/speaking/${testId}`);
        if (speakingRes.ok) {
          const data = await speakingRes.json();
          setSpeakingData(data);
        } else {
          setSpeakingData([]);
        }
      } catch {
        setSpeakingData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <div className="h-6 w-px bg-slate-200"></div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Database className="text-primary" size={32} />
          Database Viewer
        </h1>
        <button
          onClick={loadTests}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Test List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Table size={20} />
            IELTS Tests ({tests.length})
          </h2>
        </div>
        <div className="p-6">
          {tests.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No tests found in database.</p>
          ) : (
            <div className="grid gap-4">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedTest === test.id
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-primary/50'
                  }`}
                  onClick={() => loadTestData(test.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">ID: {test.id} - {test.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Created: {new Date(test.created_at).toLocaleString()}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Test Data */}
      {selectedTest && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">
                Test ID: {selectedTest} Data Details
                {loading && <span className="ml-2 text-primary">Loading...</span>}
              </h2>
              <button
                onClick={() => selectedTest && reparseTest(selectedTest)}
                disabled={reparsing}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
              >
                {reparsing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {reparsing ? 'Reparsing...' : 'Reparse with AI'}
              </button>
            </div>
            {parseMessage && (
              <div className={`mt-3 p-3 rounded-lg ${
                parseMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {parseMessage.text}
              </div>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {/* Listening */}
            <div className="p-6">
              <button
                onClick={() => toggleSection('listening')}
                className="flex items-center gap-2 font-bold text-slate-900 hover:text-primary transition-colors"
              >
                {expandedSections.has('listening') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                Listening ({listeningData.length} sections)
              </button>
              {expandedSections.has('listening') && (
                <div className="mt-4 pl-8">
                  {listeningData.length === 0 ? (
                    <p className="text-slate-500">No listening data</p>
                  ) : (
                    <div className="space-y-4">
                      {listeningData.map((section) => (
                        <div key={section.id} className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-bold text-slate-900">Section {section.section}</h4>
                          <p className="text-sm text-slate-500">Questions: {section.questions.length}</p>
                          <pre className="mt-2 p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs">
                            {JSON.stringify(section.questions, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reading */}
            <div className="p-6">
              <button
                onClick={() => toggleSection('reading')}
                className="flex items-center gap-2 font-bold text-slate-900 hover:text-primary transition-colors"
              >
                {expandedSections.has('reading') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                Reading ({readingData.length} passages)
              </button>
              {expandedSections.has('reading') && (
                <div className="mt-4 pl-8">
                  {readingData.length === 0 ? (
                    <p className="text-slate-500">No reading data</p>
                  ) : (
                    <div className="space-y-4">
                      {readingData.map((passage) => (
                        <div key={passage.id} className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-bold text-slate-900">Passage {passage.passageNum}</h4>
                          <p className="text-sm text-slate-500">Questions: {passage.questions.length}</p>
                          <div className="mt-2">
                            <h5 className="text-sm font-medium text-slate-700">Passage Content:</h5>
                            <p className="mt-1 p-3 bg-white border border-slate-200 rounded text text-sm-slate-600">
                              {passage.passage || <span className="text-red-500">Empty!</span>}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Character count: {passage.passage?.length || 0}
                            </p>
                          </div>
                          <pre className="mt-2 p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs">
                            {JSON.stringify(passage.questions, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Writing */}
            <div className="p-6">
              <button
                onClick={() => toggleSection('writing')}
                className="flex items-center gap-2 font-bold text-slate-900 hover:text-primary transition-colors"
              >
                {expandedSections.has('writing') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                Writing
              </button>
              {expandedSections.has('writing') && (
                <div className="mt-4 pl-8">
                  {!writingData ? (
                    <p className="text-slate-500">No writing data</p>
                  ) : (
                    <div className="space-y-4">
                      {writingData.task1_prompt && (
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-bold text-slate-900">Task 1</h4>
                          <pre className="mt-2 p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs">
                            {writingData.task1_prompt}
                          </pre>
                        </div>
                      )}
                      {writingData.task2_prompt && (
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-bold text-slate-900">Task 2</h4>
                          <pre className="mt-2 p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs">
                            {writingData.task2_prompt}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Speaking */}
            <div className="p-6">
              <button
                onClick={() => toggleSection('speaking')}
                className="flex items-center gap-2 font-bold text-slate-900 hover:text-primary transition-colors"
              >
                {expandedSections.has('speaking') ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                Speaking ({speakingData.length} cards)
              </button>
              {expandedSections.has('speaking') && (
                <div className="mt-4 pl-8">
                  {speakingData.length === 0 ? (
                    <p className="text-slate-500">No speaking data</p>
                  ) : (
                    <div className="space-y-4">
                      {speakingData.map((card) => (
                        <div key={card.id} className="p-4 bg-slate-50 rounded-lg">
                          <pre className="mt-2 p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs">
                            {JSON.stringify(card, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Raw JSON Output */}
      {selectedTest && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Raw API Response</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Listening</h3>
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs h-48">
                  {JSON.stringify(listeningData, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Reading</h3>
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs h-48">
                  {JSON.stringify(readingData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseViewer;
