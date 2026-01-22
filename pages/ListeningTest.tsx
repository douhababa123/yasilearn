import React from 'react';
import { Volume2, Settings, HelpCircle, Play, Timer, ArrowLeft, ArrowRight, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ListeningTest = () => {
  return (
    <div className="flex flex-col h-screen bg-[#f6f6f8] overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3 bg-white z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">IELTS Academic Listening</h1>
          </div>
          <span className="h-6 w-px bg-gray-200 mx-2"></span>
          <span className="text-sm font-medium text-gray-500">Part 1</span>
        </div>
        <div className="flex items-center justify-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full">
          <Timer size={18} className="text-primary" />
          <span className="text-primary font-bold text-lg tabular-nums">29:45</span>
          <span className="text-xs text-primary/70 font-medium ml-1">remaining</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <Volume2 size={20} />
          </button>
          <button className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">
            <HelpCircle size={18} />
            <span>Help</span>
          </button>
          <button className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Audio Player Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-8 shrink-0 flex items-center gap-6 shadow-sm z-10">
        <div className="flex items-center justify-center size-10 rounded-full bg-primary text-white shrink-0">
          <Play size={24} className="ml-1" fill="currentColor" />
        </div>
        <div className="flex flex-col flex-1 gap-1.5">
          <div className="flex justify-between items-end">
            <span className="text-xs font-semibold text-gray-700">Track 14 - Section 1</span>
            <span className="text-xs font-medium text-gray-500">03:45 / 30:00</span>
          </div>
          <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-primary w-[12%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#f6f6f8] p-6 md:p-10 flex justify-center">
        <div className="w-full max-w-[960px] flex flex-col gap-6 pb-20">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-slate-900 text-2xl font-bold leading-tight">Questions 1-10</h2>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Form Completion</span>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 items-start">
                    <div className="text-primary mt-0.5">
                        <HelpCircle size={20} />
                    </div>
                    <div>
                        <p className="text-slate-700 text-sm font-medium leading-relaxed">
                            Complete the notes below.
                        </p>
                        <p className="text-slate-900 text-sm font-bold leading-relaxed mt-1">
                            Write ONE WORD AND/OR A NUMBER for each answer.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Building size={24} className="text-slate-400" />
                        West Bay Hotel - Booking Enquiry
                    </h3>
                </div>
                
                <div className="p-8">
                    <div className="grid grid-cols-1 gap-0 text-slate-900 text-base">
                        {[
                            { label: "Customer Name:", pre: "Mr.", q: "1", width: "w-48" },
                            { label: "Date of arrival:", q: "2", width: "w-24", post: "August" },
                            { label: "Length of stay:", q: "3", width: "w-24", post: "nights" },
                            { label: "Room type required:", pre: "Double with a", q: "4", width: "w-40", post: "view" },
                            { label: "Cost per night:", pre: "£", q: "5", width: "w-32" },
                            { label: "Special Request:", pre: "Provide", q: "6", width: "w-48", post: "only" }
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 py-4 border-b border-dashed border-gray-200 last:border-0">
                                <span className="font-semibold min-w-[180px] text-gray-700">{item.label}</span>
                                <div className="flex items-center gap-2 flex-1 flex-wrap">
                                    {item.pre && <span>{item.pre}</span>}
                                    <div className="relative group">
                                        <input className={`bg-slate-50 border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${item.width} text-slate-900 font-medium transition-all`} type="text" />
                                        <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex items-center justify-center size-6 rounded-full bg-gray-200 text-xs font-bold text-gray-600 group-focus-within:bg-primary group-focus-within:text-white transition-colors">
                                            {item.q}
                                        </div>
                                    </div>
                                    {item.post && <span>{item.post}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 h-[88px] shrink-0 flex items-center px-6 gap-4 z-20">
          <Link to="/" className="flex items-center justify-center gap-2 px-6 h-12 rounded-lg border-2 border-slate-200 text-gray-600 font-bold hover:bg-slate-50 transition-all">
              <ArrowLeft size={20} />
              Review
          </Link>
          
          <div className="flex-1 overflow-x-auto scrollbar-hide mx-4">
              <div className="flex gap-2 items-center h-full py-2 min-w-max">
                  <button className="w-10 h-10 rounded bg-primary text-white font-bold text-sm shadow-md ring-2 ring-primary ring-offset-2">1</button>
                  {[2,3,4,5,6].map(n => (
                      <button key={n} className="w-10 h-10 rounded bg-slate-900 text-white font-bold text-sm opacity-60 hover:opacity-100 transition-opacity">{n}</button>
                  ))}
                  {[7,8,9,10].map(n => (
                      <button key={n} className="w-10 h-10 rounded bg-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-300 transition-colors">{n}</button>
                  ))}
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <button className="w-10 h-10 rounded bg-white border border-gray-300 text-gray-500 font-medium text-sm">11</button>
                  <button className="w-10 h-10 rounded bg-white border border-gray-300 text-gray-500 font-medium text-sm">...</button>
                  <button className="w-10 h-10 rounded bg-white border border-gray-300 text-gray-500 font-medium text-sm">40</button>
              </div>
          </div>

          <button className="flex items-center justify-center gap-2 px-8 h-12 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all">
              Next
              <ArrowRight size={20} />
          </button>
      </footer>
    </div>
  );
};