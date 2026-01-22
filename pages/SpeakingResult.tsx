import React from 'react';
import { 
  RotateCcw, 
  TrendingUp, 
  AudioWaveform, 
  PlayCircle, 
  SkipBack, 
  SkipForward, 
  Play, 
  Volume2, 
  Share2, 
  FileText,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ScoreCard = ({ label, score, highlight, width }: any) => (
  <div className={`flex flex-col gap-2 rounded-xl p-5 border transition-colors ${
    highlight 
      ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 relative overflow-hidden group' 
      : 'bg-white border-slate-100 hover:border-primary/50'
  }`}>
    {highlight && <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all"></div>}
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <div className="flex items-end gap-2 relative z-10">
      <p className="text-slate-900 text-2xl font-bold">{score}</p>
      {highlight && (
        <div className="flex items-center text-green-600 text-xs font-bold mb-1.5 bg-green-100 px-1.5 py-0.5 rounded">
          <TrendingUp size={14} className="mr-1" /> 0.5
        </div>
      )}
    </div>
    {!highlight && (
      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-auto">
        <div className={`h-1.5 rounded-full ${width}`} style={{ backgroundColor: label === 'Pronunciation' ? '#10b981' : label === 'Fluency' ? '#facc15' : '#135bec' }}></div>
      </div>
    )}
  </div>
);

export const SpeakingResult = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] pb-28">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-4">
           <h2 className="text-slate-900 font-bold text-lg">Speaking Assessment #42</h2>
        </div>
        <button className="flex items-center gap-2 rounded-lg h-9 px-4 bg-primary text-white text-sm font-bold shadow-md hover:bg-blue-600 transition-colors">
          <RotateCcw size={16} /> Retake Test
        </button>
      </header>

      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
        {/* Score Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ScoreCard label="Overall Band" score="6.5" highlight={true} />
          <ScoreCard label="Fluency" score="6.0" width="width: 60%" />
          <ScoreCard label="Pronunciation" score="7.0" width="width: 70%" />
          <ScoreCard label="Grammar" score="6.5" width="width: 65%" />
          <ScoreCard label="Lexical Resource" score="6.0" width="width: 60%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Transcript */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <AudioWaveform size={20} className="text-primary" />
                  <h3 className="text-slate-900 font-bold text-lg">Voice Analysis</h3>
                </div>
                <div className="flex gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Excellent</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Mispronounced</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Hesitation</span>
                </div>
              </div>
              <div className="p-8 text-lg leading-relaxed text-slate-700 font-light">
                <p>
                   Well, I would like to talk about a recent trip I took to the mountains. <span className="bg-amber-100 text-amber-700 px-1 rounded cursor-help border-b-2 border-amber-300">Uhm</span>, it was really a <span className="bg-green-100 text-green-700 px-1 rounded font-medium">memorable</span> experience. I went there with my family last summer. We decided to go by car because the <span className="bg-red-100 text-red-700 px-1 rounded cursor-pointer border-b-2 border-red-300 border-dashed" title="Pronunciation Error: Scenery">senary</span> along the way is absolutely <span className="bg-green-100 text-green-700 px-1 rounded font-medium">breathtaking</span>. However, the weather was a bit <span className="bg-red-100 text-red-700 px-1 rounded cursor-pointer border-b-2 border-red-300 border-dashed">un-pre-dic-ta-ble</span>. One moment it was sunny, and the next it was raining cats and dogs. <span className="bg-amber-100 text-amber-700 px-1 rounded cursor-help border-b-2 border-amber-300">...</span> We stayed in a small cottage near a lake. It was very peaceful.
                </p>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-slate-900 font-bold text-lg">AI Recommendations</h3>
                <p className="text-slate-500 text-sm mt-1">Focus on these 3 areas to improve.</p>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-md text-red-600"><Volume2 size={20} /></div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Pronunciation Error</h4>
                      <p className="text-xs text-slate-500 mt-1">You said <span className="line-through text-red-500">"senary"</span></p>
                      <p className="text-sm font-medium text-green-600 mt-1">Correct: "Scenery" (/ˈsiː.nər.i/)</p>
                    </div>
                  </div>
                  <button className="w-full mt-3 flex items-center justify-center gap-2 bg-white border border-slate-200 py-2 rounded-md text-sm font-medium hover:border-primary transition-colors group">
                    <PlayCircle size={16} className="text-primary group-hover:scale-110 transition-transform" /> Listen & Practice
                  </button>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-md text-blue-600"><BookOpen size={20} /></div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Vocab Upgrade</h4>
                      <p className="text-xs text-slate-500 mt-1">Instead of "very peaceful"</p>
                      <p className="text-sm font-medium text-blue-600 mt-1">Try: "Tranquil" or "Serene"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-xl z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
           <div className="flex items-center gap-4">
             <SkipBack size={24} className="text-slate-400 cursor-pointer hover:text-primary" />
             <button className="size-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-600 transition-transform active:scale-95">
               <Play size={24} fill="currentColor" className="ml-1" />
             </button>
             <SkipForward size={24} className="text-slate-400 cursor-pointer hover:text-primary" />
           </div>
           <div className="flex-1 flex items-center gap-4">
             <span className="text-xs font-mono text-slate-500 w-10 text-right">0:42</span>
             <div className="h-10 flex-1 bg-slate-100 rounded-md overflow-hidden relative cursor-pointer group">
               <div className="absolute inset-0 flex items-center gap-[2px] px-2">
                 {[...Array(60)].map((_, i) => (
                   <div key={i} className={`w-1 rounded-full ${i < 20 ? 'bg-primary' : 'bg-slate-300'}`} style={{ height: `${Math.random() * 80 + 20}%`}}></div>
                 ))}
               </div>
             </div>
             <span className="text-xs font-mono text-slate-500 w-10">2:14</span>
           </div>
           <div className="w-32 flex items-center gap-2">
             <Volume2 size={18} className="text-slate-400" />
             <div className="h-1 bg-slate-200 rounded-full flex-1">
               <div className="w-[70%] h-full bg-slate-500 rounded-full"></div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};