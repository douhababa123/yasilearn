import React from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  Legend
} from 'recharts';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const data = [
  { subject: 'Listening', A: 8.5, fullMark: 9 },
  { subject: 'Reading', A: 7.0, fullMark: 9 },
  { subject: 'Writing', A: 6.5, fullMark: 9 },
  { subject: 'Speaking', A: 7.5, fullMark: 9 },
];

export const MockResult = () => {
  return (
    <div className="min-h-screen bg-[#f6f6f8] p-4 md:p-10 lg:px-40 flex justify-center">
      <div className="max-w-[1200px] w-full flex flex-col gap-6">
         {/* Header */}
         <div className="flex justify-between items-end">
           <div>
             <Link to="/" className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-2 hover:text-primary">
               <ArrowLeft size={16} /> Back to Dashboard
             </Link>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mock Test #4 Results</h1>
             <p className="text-slate-500 mt-1">Completed on Oct 24, 2023 • 2h 45m duration</p>
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50">
             <Download size={18} /> PDF Report
           </button>
         </div>

         {/* Hero */}
         <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#0f44b0] p-8 md:p-10 shadow-2xl shadow-primary/20">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="max-w-[600px]">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 w-fit mb-4">
                 <span className="text-white text-xs font-bold uppercase tracking-wider">Test Complete</span>
               </div>
               <h2 className="text-white text-4xl font-black leading-tight">
                 Excellent work, Alex! <br/>Predicted Overall Band: <span className="text-5xl inline-block ml-2 border-b-4 border-white/30">7.5</span>
               </h2>
               <p className="text-blue-100 text-lg mt-4 max-w-lg">You are just 0.5 bands away from your target score of 8.0. Your Listening skills are exceptional!</p>
             </div>
             
             {/* Circular Progress */}
             <div className="relative size-48 shrink-0">
                <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-blue-800/50" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="3" />
                  <path className="text-white drop-shadow-md" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="83, 100" strokeWidth="3" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                   <span className="text-5xl font-black">7.5</span>
                   <span className="text-xs font-bold text-blue-200 uppercase tracking-widest mt-1">Overall</span>
                </div>
             </div>
           </div>
         </div>

         {/* Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Headphones size={24} /></div>
                   <div className="text-right">
                     <span className="text-3xl font-black text-slate-900">8.5</span>
                     <span className="block text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">Passing</span>
                   </div>
                </div>
                <div>
                   <h4 className="font-bold text-lg text-slate-900">Listening</h4>
                   <p className="text-sm text-slate-500 mb-4">Expert User level. You missed only 3 questions.</p>
                   <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full w-[95%]"></div></div>
                </div>
              </div>

               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={24} /></div>
                   <div className="text-right">
                     <span className="text-3xl font-black text-slate-900">7.0</span>
                     <span className="block text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">Good</span>
                   </div>
                </div>
                <div>
                   <h4 className="font-bold text-lg text-slate-900">Reading</h4>
                   <p className="text-sm text-slate-500 mb-4">Good User. Time management needs work.</p>
                   <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full w-[78%]"></div></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">FOCUS AREA</div>
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><PenTool size={24} /></div>
                   <div className="text-right">
                     <span className="text-3xl font-black text-slate-900">6.5</span>
                     <span className="block text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1">Competent</span>
                   </div>
                </div>
                <div>
                   <h4 className="font-bold text-lg text-slate-900">Writing</h4>
                   <p className="text-sm text-slate-500 mb-4">Lexical resource was limited in Task 2.</p>
                   <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full w-[72%]"></div></div>
                </div>
              </div>

               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Mic size={24} /></div>
                   <div className="text-right">
                     <span className="text-3xl font-black text-slate-900">7.5</span>
                     <span className="block text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full mt-1">Good</span>
                   </div>
                </div>
                <div>
                   <h4 className="font-bold text-lg text-slate-900">Speaking</h4>
                   <p className="text-sm text-slate-500 mb-4">Pronunciation was clear, minor hesitation.</p>
                   <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full w-[83%]"></div></div>
                </div>
              </div>
            </div>

            {/* Radar Chart & Next Steps */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm h-80 flex flex-col">
                 <div className="flex justify-between items-center mb-2">
                   <h4 className="font-bold text-slate-900 text-sm">Target Gap Analysis</h4>
                   <div className="flex gap-2 text-xs">
                     <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> You</span>
                     <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Target (8.0)</span>
                   </div>
                 </div>
                 <div className="flex-1 w-full min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                       <PolarGrid stroke="#e2e8f0" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                       <PolarRadiusAxis angle={30} domain={[0, 9]} tick={false} axisLine={false} />
                       <Radar name="You" dataKey="A" stroke="#135bec" fill="#135bec" fillOpacity={0.2} />
                       <Radar name="Target" dataKey="fullMark" stroke="#cbd5e1" strokeDasharray="4 4" fill="transparent" />
                     </RadarChart>
                   </ResponsiveContainer>
                 </div>
                 <div className="pt-2 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500">Your writing score is pulling down your average.</p>
                 </div>
              </div>

              <div className="bg-slate-900 rounded-xl overflow-hidden">
                 <div className="p-4 bg-slate-800/50 border-b border-slate-700">
                    <h4 className="text-white font-bold text-sm">Recommended Next Steps</h4>
                 </div>
                 <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer group">
                       <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-bold">1</div>
                       <div className="flex-1">
                          <p className="text-slate-200 text-sm font-semibold group-hover:text-primary transition-colors">Practice Coherence</p>
                          <p className="text-slate-500 text-xs">Writing Task 2 • 15 min</p>
                       </div>
                       <ChevronRight size={16} className="text-slate-600" />
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer group">
                       <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs font-bold">2</div>
                       <div className="flex-1">
                          <p className="text-slate-200 text-sm font-semibold group-hover:text-primary transition-colors">Review T/F/NG</p>
                          <p className="text-slate-500 text-xs">Reading Sec 3 • 20 min</p>
                       </div>
                       <ChevronRight size={16} className="text-slate-600" />
                    </div>
                 </div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};