import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, FileText, Music, File, CheckCircle, Loader2, AlertCircle, FolderOpen, Sparkles } from 'lucide-react';

interface Test {
  id: number;
  name: string;
  pdf_path: string;
  created_at: string;
  parsed_at?: string;
}

export const UploadPage = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [parsingId, setParsingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);

  // Refs for file inputs
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Load existing tests
  React.useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const response = await fetch('/api/tests');
      if (!response.ok) throw new Error('Failed to load tests');
      const data = await response.json();
      setTests(data);
    } catch (err) {
      console.error('Failed to load tests:', err);
      setMessage({ type: 'error', text: 'Failed to load tests' });
    } finally {
      setLoadingTests(false);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setMessage(null);
    } else if (file) {
      setMessage({ type: 'error', text: 'Please select a PDF file' });
    }
  };

  const handleDocxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.toLowerCase().endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setDocxFile(file);
      setMessage(null);
    } else if (file) {
      setMessage({ type: 'error', text: 'Please select a Word document (.docx)' });
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('audio/'));
    setAudioFiles(validFiles);
    setMessage(null);
  };

  const uploadPdf = async () => {
    if (!pdfFile) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', pdfFile);

      const response = await fetch('/api/upload/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
      }

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: `PDF "${result.originalName}" uploaded successfully!` });
        setPdfFile(null);
        // Reset file input using ref
        if (pdfInputRef.current) {
          pdfInputRef.current.value = '';
        }
        loadTests();
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed' });
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setUploading(false);
    }
  };

  const uploadDocx = async () => {
    if (!docxFile) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', docxFile);

      const response = await fetch('/api/upload/docx', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
      }

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: `Word document "${result.originalName}" uploaded successfully!` });
        setDocxFile(null);
        // Reset file input using ref
        if (docxInputRef.current) {
          docxInputRef.current.value = '';
        }
        loadTests();
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed' });
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setUploading(false);
    }
  };

  const parseTest = async (testId: number) => {
    setParsingId(testId);
    setMessage(null);

    try {
      const response = await fetch(`/api/tests/${testId}/parse`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully parsed: ${result.parsedSections.listening} listening sections, ${result.parsedSections.reading} reading passages, ${result.parsedSections.speaking} speaking cards`
        });
        loadTests();
      } else if (result.error === 'scanned_pdf') {
        setMessage({
          type: 'error',
          text: result.message
        });
      } else if (result.error === 'ai_content_filtered') {
        setMessage({
          type: 'error',
          text: result.message
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Parse failed' });
      }
    } catch (err) {
      console.error('Parse error:', err);
      setMessage({ type: 'error', text: 'Network error during parsing' });
    } finally {
      setParsingId(null);
    }
  };

  const uploadAudio = async () => {
    if (audioFiles.length === 0) return;

    setUploading(true);
    setMessage(null);

    try {
      for (const file of audioFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/audio', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json();

        if (!result.success) {
          setMessage({ type: 'error', text: `Failed to upload ${file.name}` });
          return;
        }
      }

      setMessage({ type: 'success', text: `${audioFiles.length} audio file(s) uploaded successfully!` });
      setAudioFiles([]);
      // Reset file input using ref
      if (audioInputRef.current) {
        audioInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Audio upload error:', err);
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <FolderOpen className="text-primary" size={32} />
          Upload Materials
        </h1>
        <p className="text-slate-500 max-w-2xl">
          Upload IELTS practice test materials. PDF or Word documents will be automatically parsed to extract questions.
        </p>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Upload */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <FileText className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Upload PDF</h3>
                <p className="text-sm text-slate-500">IELTS test paper (PDF)</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                ref={pdfInputRef}
                id="pdf-input"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="hidden"
              />
              <label htmlFor="pdf-input" className="cursor-pointer flex flex-col items-center gap-3">
                <UploadIcon className="text-slate-400" size={32} />
                <div className="text-sm">
                  {pdfFile ? (
                    <span className="text-primary font-medium">{pdfFile.name}</span>
                  ) : (
                    <>
                      <span className="text-primary font-medium">Click to select</span>
                      <span className="text-slate-400"> or drag and drop</span>
                    </>
                  )}
                </div>
                <span className="text-xs text-slate-400">PDF only, max 50MB</span>
              </label>
            </div>

            {pdfFile && (
              <button
                onClick={uploadPdf}
                disabled={uploading}
                className="w-full mt-4 py-3 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon size={18} />
                    Upload PDF
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Word Document Upload */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <File className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Upload Word</h3>
                <p className="text-sm text-slate-500">IELTS test document (.docx)</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                ref={docxInputRef}
                id="docx-input"
                accept=".docx"
                onChange={handleDocxChange}
                className="hidden"
              />
              <label htmlFor="docx-input" className="cursor-pointer flex flex-col items-center gap-3">
                <File className="text-slate-400" size={32} />
                <div className="text-sm">
                  {docxFile ? (
                    <span className="text-primary font-medium">{docxFile.name}</span>
                  ) : (
                    <>
                      <span className="text-primary font-medium">Click to select</span>
                      <span className="text-slate-400"> or drag and drop</span>
                    </>
                  )}
                </div>
                <span className="text-xs text-slate-400">Word document (.docx) only</span>
              </label>
            </div>

            {docxFile && (
              <button
                onClick={uploadDocx}
                disabled={uploading}
                className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon size={18} />
                    Upload Word
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Audio Upload */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Music className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Upload Audio</h3>
                <p className="text-sm text-slate-500">Listening test audio (MP3)</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                ref={audioInputRef}
                id="audio-input"
                accept="audio/*"
                multiple
                onChange={handleAudioChange}
                className="hidden"
              />
              <label htmlFor="audio-input" className="cursor-pointer flex flex-col items-center gap-3">
                <Music className="text-slate-400" size={32} />
                <div className="text-sm">
                  {audioFiles.length > 0 ? (
                    <span className="text-primary font-medium">{audioFiles.length} file(s) selected</span>
                  ) : (
                    <>
                      <span className="text-primary font-medium">Click to select</span>
                      <span className="text-slate-400"> or drag and drop</span>
                    </>
                  )}
                </div>
                <span className="text-xs text-slate-400">MP3, WAV, M4A (multiple files allowed)</span>
              </label>
            </div>

            {audioFiles.length > 0 && (
              <button
                onClick={uploadAudio}
                disabled={uploading}
                className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon size={18} />
                    Upload {audioFiles.length} Audio File(s)
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-start gap-3">
            {message.type === 'success' ? <CheckCircle size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
            <div>
              <p>{message.text}</p>
              {message.type === 'error' && (
                <p className="mt-2 text-sm opacity-80">
                  {message.text.includes('AI') || message.text.includes('敏感') ? (
                    <>
                      💡 <strong>提示:</strong> AI 内容审核机制可能会误判某些雅思材料。请尝试上传其他雅思练习材料。
                    </>
                  ) : message.text.includes('Word') ? (
                    <>
                      💡 <strong>Tip:</strong> Please upload a valid <strong>Word document (.docx)</strong> file.
                    </>
                  ) : (
                    <>
                      💡 <strong>Tip:</strong> Please upload a <strong>text-based PDF or Word document</strong> (with selectable text).
                      Scanned PDFs (image-only) are not supported.
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Tests List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <FolderOpen size={20} />
            Uploaded Tests
          </h3>
        </div>

        <div className="p-6">
          {loadingTests ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-slate-300" />
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText size={48} className="mx-auto mb-3 opacity-20" />
              <p>No tests uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-slate-400" size={20} />
                    <div>
                      <p className="font-medium text-slate-900">{test.name}</p>
                      <p className="text-xs text-slate-500">
                        Uploaded {new Date(test.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => parseTest(test.id)}
                      disabled={parsingId === test.id}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {parsingId === test.id ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Parsing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Parse with AI
                        </>
                      )}
                    </button>
                    <a
                      href={test.pdf_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
