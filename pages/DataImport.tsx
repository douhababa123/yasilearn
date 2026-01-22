import React, { useState } from 'react';
import { Database, Upload, ArrowRight, Download, FileJson, FileText, Loader2, CheckCircle, Copy, Save, Server } from 'lucide-react';
import { parseVocabularyData, VocabItem } from '../services/ai';

export const DataImport = () => {
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedData, setParsedData] = useState<VocabItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{success: boolean, message: string} | null>(null);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    setParsedData(null);
    setSaveStatus(null);

    try {
      const result = await parseVocabularyData(rawText);
      setParsedData(result);
    } catch (err) {
      setError("Failed to parse data. Please check your API key or input format.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!parsedData) return;
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // FIXED: Use relative path /api/vocab/import instead of http://localhost:3001/api/vocab/import
      const response = await fetch('/api/vocab/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || 'Failed to save');

      setSaveStatus({
        success: true,
        message: `Successfully saved ${result.count} words to the database!`
      });
    } catch (err: any) {
      setSaveStatus({
        success: false,
        message: err.message || 'Connection failed. Is the backend server running?'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (parsedData) {
      navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2));
      alert("JSON copied to clipboard!");
    }
  };

  const downloadJson = () => {
    if (!parsedData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parsedData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "vocabulary_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-screen flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Database className="text-primary" size={32} />
          Data Import Tool
        </h1>
        <p className="text-slate-500 max-w-2xl">
          ETL (Extract, Transform, Load) Pipeline Phase 1. Paste your raw Markdown or HTML vocabulary notes below, 
          and AI will clean, correct, and structure them into standard JSON for the database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
        {/* Input Section */}
        <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-slate-500" />
                <span className="font-bold text-slate-700 text-sm">Raw Input (Markdown/HTML)</span>
              </div>
              <button 
                onClick={() => setRawText("# Unit 1: Environment\n\n1. Sustainable - able to be maintained.\n   <img src=\"https://images.unsplash.com/photo-1542601906990-b4d3fb7d5fa5?auto=format&fit=crop&w=800\" />\n2. Contamination (n) - pollution.\n3. Ubiquitous - found everywhere.")}
                className="text-xs text-primary font-medium hover:underline"
              >
                Load Sample Data
              </button>
           </div>
           <textarea 
             className="flex-1 p-4 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20 font-mono text-sm text-slate-700 bg-white"
             placeholder={`Paste your notes here...

Example with HTML Image:
# Environment
- Sustainable
  <img src="https://example.com/nature.jpg" />
- Toxic: poisonous`}
             value={rawText}
             onChange={(e) => setRawText(e.target.value)}
             spellCheck={false}
           />
           <div className="p-4 border-t border-slate-100 bg-slate-50">
             <button 
               onClick={handleParse}
               disabled={isProcessing || !rawText.trim()}
               className="w-full py-3 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isProcessing ? (
                 <>
                   <Loader2 size={18} className="animate-spin" />
                   AI Processing...
                 </>
               ) : (
                 <>
                   Run ETL Pipeline <ArrowRight size={18} />
                 </>
               )}
             </button>
           </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700 relative">
           <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileJson size={18} className="text-green-400" />
                <span className="font-bold text-slate-200 text-sm">Structured JSON Output</span>
              </div>
              {parsedData && (
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" title="Copy">
                    <Copy size={16} />
                  </button>
                  <button onClick={downloadJson} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" title="Download">
                    <Download size={16} />
                  </button>
                </div>
              )}
           </div>
           
           <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-slate-300">
             {isProcessing ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                 <Loader2 size={40} className="animate-spin text-primary" />
                 <p>Extracting entities...</p>
                 <p>Finding hotlinked images...</p>
                 <p>Generating phonetics & examples...</p>
               </div>
             ) : error ? (
               <div className="text-red-400 p-4 border border-red-900/50 bg-red-900/20 rounded-lg">
                 {error}
               </div>
             ) : parsedData ? (
               <pre>{JSON.stringify(parsedData, null, 2)}</pre>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-600">
                 <Database size={48} className="mb-4 opacity-20" />
                 <p>Waiting for data processing...</p>
               </div>
             )}
           </div>

           {parsedData && (
             <div className="p-3 bg-slate-800 border-t border-slate-700 flex justify-between items-center">
               <div className="text-green-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle size={14} />
                  {parsedData.length} Items Extracted
               </div>
               <button 
                  onClick={handleSaveToDatabase}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                 Save to Database
               </button>
             </div>
           )}
           
           {/* Save Status Notification */}
           {saveStatus && (
              <div className={`absolute bottom-4 left-4 right-4 p-4 rounded-lg shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${saveStatus.success ? 'bg-green-900/80 border-green-500/50 text-white' : 'bg-red-900/80 border-red-500/50 text-white'}`}>
                  <div className="flex items-center gap-3">
                     {saveStatus.success ? <Server size={20} className="text-green-400" /> : <Server size={20} className="text-red-400" />}
                     <div>
                        <p className="font-bold text-sm">{saveStatus.success ? 'Success' : 'Error'}</p>
                        <p className="text-xs opacity-90">{saveStatus.message}</p>
                     </div>
                  </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};