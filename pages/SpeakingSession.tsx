import React from 'react';
import { Mic, VideoOff, Pause, ArrowRight, PhoneOff, Menu, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';

const WaveformBar: React.FC<{ height: string, delay: string }> = ({ height, delay }) => (
  <div 
    className="w-1.5 bg-primary rounded-full waveform-bar"
    style={{ height, animationDelay: delay }}
  ></div>
);

export const SpeakingSession = () => {
  return (
    <div className="flex h-screen bg-[#f6f6f8] overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 z-10 fixed w-full top-0">
             <Menu className="text-slate-500" />
             <span className="font-bold">Speaking Sim</span>
        </header>

        <main className="flex-1 flex flex-col h-full pt-16 lg:pt-0 relative">
            {/* Desktop Header */}
            <header className="h-16 px-6 lg:px-8 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 z-10 hidden lg:flex">
                <div>
                    <h1 className="text-lg font-bold text-slate-900 leading-tight">Speaking Simulation</h1>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Part 2: Individual Long Turn</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Live Session</span>
                    </div>
                    <Link to="/speaking/result" className="bg-white hover:bg-red-50 text-red-600 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
                        <PhoneOff size={18} />
                        End Test
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
                {/* Main Content (Video & Controls) */}
                <div className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto relative bg-slate-50 items-center justify-start">
                    
                    {/* Examiner Video Feed */}
                    <div className="w-full max-w-5xl aspect-video bg-slate-900 rounded-2xl shadow-xl overflow-hidden relative group border border-slate-200 mb-8 shrink-0">
                        <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8Q9gY1mhMHRcTXrdAtvAwaxYgsi8ArkVGUN8-XA6RCMA1FRusg5rP8eECB19uL2xTfY1VziOp00iNVwOcQX6JcataRe2i4nXkxI6NMPeDMUJMi04SqiTRwQRgrs4-21eOEuoimJ2HAoE8heIOUQebLdSltqJh4jks23YdisnDPFURV9CUBxl23TRBuxXCe3U-AgGkwCUWo4R_0LQim2XICoHE-3b6ANBWt39k5Pc9dAt6IJ4soqN4zqgrKB9T4PGgu3T5800z3B8" 
                            alt="Examiner"
                            className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 shadow-lg border border-white/10">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            Examiner: Ms. Sarah Collins
                        </div>
                        
                        {/* User Pip */}
                        <div className="absolute bottom-4 right-4 w-32 md:w-48 aspect-video bg-slate-800 rounded-lg shadow-2xl border-2 border-white/20 overflow-hidden">
                             <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white/50">
                                 <VideoOff size={32} />
                             </div>
                        </div>
                    </div>

                    {/* Waveform Visualization */}
                    <div className="w-full max-w-4xl flex flex-col items-center">
                        <div className="flex items-center justify-center gap-1.5 h-16 w-full px-12 mb-2">
                             {[...Array(20)].map((_, i) => (
                                <WaveformBar key={i} height={`${Math.random() * 80 + 20}%`} delay={`${Math.random()}s`} />
                             ))}
                        </div>
                        <div className="text-sm font-mono font-medium text-slate-500 mb-8 tracking-wider">
                            REC <span className="text-slate-900 font-bold ml-2">01:12</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6">
                            <button className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors shadow-sm">
                                <Pause size={24} />
                            </button>
                            <button className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-xl shadow-red-500/20 flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 group relative">
                                <span className="absolute w-full h-full rounded-full border-4 border-red-500/30 animate-ping"></span>
                                <Mic size={40} className="fill-current" />
                            </button>
                            <button className="px-6 py-4 rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3">
                                Next Question
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="w-full lg:w-[420px] h-full flex flex-col border-l border-slate-200 bg-white z-10 shadow-xl shadow-slate-200/50">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Speaking Timer</span>
                            <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Part 2 Goal: 1-2 mins</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-mono font-bold text-slate-900 tracking-tight">01:12</span>
                            <span className="text-sm font-medium text-slate-400">/ 02:00</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="bg-teal-500 h-full rounded-full w-[60%] transition-all duration-1000"></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg text-primary shrink-0">
                                    <Circle size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-1">Examiner's Note</h4>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        You have 1 minute to prepare your notes. You should speak for 1 to 2 minutes on the topic below. I will tell you when to stop.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl shadow-sm bg-white relative overflow-hidden">
                            <div className="h-1.5 bg-gradient-to-r from-primary to-teal-400 w-full"></div>
                            <div className="p-6">
                                <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-4">
                                    Cue Card Topic
                                </span>
                                <h3 className="text-lg font-bold text-slate-800 mb-6 leading-snug">
                                    Describe a book you read recently that you found useful.
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-sm font-medium text-slate-500 uppercase text-[11px] tracking-wide">You should say:</p>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3 text-sm text-slate-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span>
                                            What kind of book it is
                                        </li>
                                        <li className="flex items-start gap-3 text-sm text-slate-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span>
                                            Who wrote it
                                        </li>
                                        <li className="flex items-start gap-3 text-sm text-slate-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span>
                                            What the book is about
                                        </li>
                                        <li className="flex items-start gap-3 text-sm text-slate-700">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span>
                                            Explain why you found it useful
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                                Preparation Notes (Optional)
                            </label>
                            <textarea className="w-full h-32 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none placeholder:text-slate-400" placeholder="Type your keywords here..."></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
};