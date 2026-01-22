import React from 'react';
import { Search, ChevronDown, Check, X, Bookmark, Flag, PlayCircle, RefreshCw, Share } from 'lucide-react';

const ErrorCard = ({ section, type, question, yourAns, correctAns, transcript, explanation, expanded = false }: any) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col gap-4 group transition-all hover:shadow-md hover:border-primary/30">
    <div className="flex justify-between items-start gap-4">
      <div className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20" />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">{section}</span>
            <span className={`bg-${type === 'Number Distinction' ? 'red' : type === 'Spelling' ? 'blue' : 'purple'}-50 text-${type === 'Number Distinction' ? 'red' : type === 'Spelling' ? 'blue' : 'purple'}-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded`}>{type}</span>
            <span className="text-slate-400 text-xs">Added 2 days ago</span>
          </div>
          <h3 className="text-slate-900 font-medium text-lg leading-snug">{question}</h3>
        </div>
      </div>
      <Bookmark className="text-slate-300 hover:text-primary cursor-pointer" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
      <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-white rounded-full p-1 text-red-500 shadow-sm"><X size={14} strokeWidth={3} /></div>
        <div>
          <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Your Answer</span>
          <span className={`text-red-600 font-medium ${type === 'Spelling' ? 'line-through' : ''}`}>{yourAns}</span>
        </div>
      </div>
      <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center gap-3">
        <div className="bg-white rounded-full p-1 text-green-500 shadow-sm"><Check size={14} strokeWidth={3} /></div>
        <div>
          <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Correct Answer</span>
          <span className="text-green-600 font-medium">{correctAns}</span>
        </div>
      </div>
    </div>

    {expanded && (
      <div className="ml-8 mt-2 bg-slate-50 rounded-lg border border-slate-100 p-4">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
           <span className="font-bold text-sm text-slate-800 flex items-center gap-2">Detailed Analysis</span>
           <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
             <PlayCircle size={16} className="text-primary cursor-pointer" />
             <div className="h-1 w-24 bg-slate-200 rounded-full overflow-hidden"><div className="h-full w-1/3 bg-primary"></div></div>
             <span className="text-[10px] font-mono text-slate-400">00:45 / 02:15</span>
           </div>
        </div>
        <p className="text-sm text-slate-800 leading-relaxed mb-3">
           <span className="font-semibold text-slate-500">Transcript:</span> "{transcript}"
        </p>
        <p className="text-sm text-slate-800 leading-relaxed">
           <span className="font-semibold text-slate-500">Explanation:</span> {explanation}
        </p>
        <button className="text-xs font-medium text-slate-400 hover:text-primary flex items-center gap-1 mt-4">
           <Flag size={14} /> Report Issue
        </button>
      </div>
    )}

    {!expanded && (
      <div className="ml-8 mt-1">
         <button className="flex items-center gap-2 text-primary font-medium text-sm hover:text-blue-700">
            Show Analysis <ChevronDown size={16} />
         </button>
      </div>
    )}
  </div>
);

export const ErrorBank = () => {
  return (
    <div className="min-h-screen bg-[#f6f6f8] p-6 lg:p-10 max-w-[1440px] mx-auto">
      <div className="flex flex-col gap-6">
         <div className="flex flex-wrap justify-between items-end gap-4">
            <div>
               <h1 className="text-3xl font-black text-slate-900">My Error Bank</h1>
               <p className="text-slate-500">Review and learn from your past mistakes.</p>
            </div>
            <div className="hidden sm:flex items-center gap-6 bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
               <div className="text-center">
                  <span className="text-xs text-slate-400 uppercase font-semibold block">Total Errors</span>
                  <span className="text-2xl font-bold text-slate-900">142</span>
               </div>
               <div className="w-px h-8 bg-slate-200"></div>
               <div className="text-center">
                  <span className="text-xs text-slate-400 uppercase font-semibold block">Resolved</span>
                  <span className="text-2xl font-bold text-green-500">85%</span>
               </div>
            </div>
         </div>

         <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex gap-1 overflow-x-auto">
               <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold flex items-center gap-2">Listening</button>
               <button className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-medium">Reading</button>
               <button className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-medium">Writing</button>
               <button className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-medium">Speaking</button>
            </div>
            <div className="flex gap-3 px-2 items-center flex-1">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Search keywords..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-primary" />
               </div>
               <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm py-2.5 px-3">
                  <option>Newest First</option>
                  <option>Difficulty: High</option>
               </select>
            </div>
         </div>

         <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 w-full flex flex-col gap-4 pb-24">
               <div className="flex items-center justify-between px-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                     <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary/20" />
                     <span className="text-sm font-medium text-slate-500">Select All</span>
                  </label>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">Showing 3 of 142</span>
               </div>

               <ErrorCard 
                  section="Section 2" 
                  type="Number Distinction" 
                  question="The tour guide mentioned that the library was built in..." 
                  yourAns="1998" 
                  correctAns="1988" 
                  expanded={true}
                  transcript="...although originally planned for the late nineties, construction actually finished much earlier in nineteen eighty-eight..."
                  explanation='The speaker places stress on the first syllable of "eighty" (/ˈeɪ.ti/), distinguishing it from "eighteen".'
               />
               <ErrorCard 
                  section="Passage 1" 
                  type="True/False/NG" 
                  question="The author claims that bees are the only pollinators in the region." 
                  yourAns="True" 
                  correctAns="False" 
               />
               <ErrorCard 
                  section="Section 4" 
                  type="Spelling" 
                  question="The primary material used for the sculpture was..." 
                  yourAns="Aluminium" 
                  correctAns="Aluminum" 
               />
            </div>

            <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-6 sticky top-24">
               <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Review Status</h3>
                  <div className="flex items-center gap-4">
                     <div className="relative size-16 shrink-0">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                           <circle className="text-slate-100" cx="18" cy="18" fill="none" r="16" strokeWidth="4" stroke="currentColor" />
                           <circle className="text-primary" cx="18" cy="18" fill="none" r="16" strokeWidth="4" stroke="currentColor" strokeDasharray="100" strokeDashoffset="65" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">35%</div>
                     </div>
                     <div>
                        <span className="text-sm font-medium text-slate-900 block">52 Pending</span>
                        <span className="text-xs text-slate-500">Keep going!</span>
                     </div>
                  </div>
               </div>
               
               <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                   <h3 className="font-bold text-lg mb-2 relative z-10">Daily Goal</h3>
                   <p className="text-sm text-slate-300 mb-4 relative z-10">You've reviewed 3 errors today. Aim for 5.</p>
                   <div className="w-full bg-white/10 rounded-full h-1.5 mb-1 relative z-10">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: '60%' }}></div>
                   </div>
                   <span className="text-xs text-primary font-medium block text-right">3/5 Completed</span>
               </div>
            </aside>
         </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
         <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-slate-200 flex items-center gap-6">
            <div className="flex flex-col">
               <span className="text-xs font-medium text-slate-400 uppercase">Selection</span>
               <span className="text-sm font-bold text-slate-900">3 items selected</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
               <button className="bg-primary hover:bg-blue-600 text-white font-medium text-sm px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-sm">
                  <RefreshCw size={16} /> Redo Selected
               </button>
               <button className="text-slate-500 hover:bg-slate-100 p-2.5 rounded-full transition-colors">
                  <Share size={18} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};