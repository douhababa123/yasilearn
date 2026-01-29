import React from 'react';
import { 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic, 
  TrendingUp, 
  Minus, 
  TrendingDown,
  Play,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, color, bg, title, score, trend, trendLabel }: any) => (
  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-primary/30 transition-colors cursor-pointer">
    <div className="flex justify-between items-start z-10">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded ${bg} ${color}`}>
          <Icon size={20} />
        </div>
        <span className="font-medium text-slate-600 text-sm">{title}</span>
      </div>
      <span className="text-xl font-bold text-slate-900">{score}</span>
    </div>
    <div className="z-10 mt-auto">
      <span className={`text-xs font-medium flex items-center gap-1 ${
        trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-orange-500' : 'text-slate-500'
      }`}>
        {trend === 'up' ? <TrendingUp size={14} /> : trend === 'down' ? <TrendingDown size={14} /> : <Minus size={14} />}
        {trendLabel}
      </span>
    </div>
    {/* Decorative Sparkline Simulation */}
    <svg className={`absolute bottom-0 right-0 w-full h-16 -mb-1 opacity-50 transition-colors ${
      color.replace('text-', 'text-opacity-20 text-')
    }`} preserveAspectRatio="none" viewBox="0 0 100 40">
      <path d={trend === 'up' ? "M0 35 L 25 25 L 50 30 L 75 15 L 100 5 V 40 H 0 Z" : trend === 'down' ? "M0 10 Q 30 10, 50 25 T 100 35 V 40 H 0 Z" : "M0 20 L 20 20 L 40 18 L 60 20 L 80 18 L 100 18 V 40 H 0 Z"} fill="currentColor" fillOpacity="0.1" />
      <path className={`${color}`} d={trend === 'up' ? "M0 35 L 25 25 L 50 30 L 75 15 L 100 5" : trend === 'down' ? "M0 10 Q 30 10, 50 25 T 100 35" : "M0 20 L 20 20 L 40 18 L 60 20 L 80 18 L 100 18"} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  </div>
);

const TaskItem = ({ type, time, title, link }: any) => {
  const styles: any = {
    Listening: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Play },
    Reading: { bg: 'bg-teal-100', text: 'text-teal-700', icon: ArrowRight },
    Writing: { bg: 'bg-orange-100', text: 'text-orange-700', icon: PenTool },
    Speaking: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Mic },
  };
  const Style = styles[type];
  const Icon = Style.icon;

  return (
    <Link to={link} className="group flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
      <input className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary/20" type="checkbox" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${Style.bg} ${Style.text}`}>{type}</span>
          <span className="text-xs text-slate-400">{time}</span>
        </div>
        <p className="text-slate-700 font-medium">{title}</p>
      </div>
      <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-primary group-hover:text-primary transition-colors">
        <Icon size={16} />
      </div>
    </Link>
  );
};

export const Dashboard = () => {
  return (
    <div className="p-6 lg:p-10 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, Sarah 👋</h1>
          <p className="text-slate-500 text-sm max-w-lg">
            You are on track to reach your target score of 8.0 by next month. Keep up the consistency!
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-100 min-w-[140px]">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Band</span>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">7.0</span>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded mb-1">+0.5</span>
            </div>
          </div>
          <div className="flex flex-col bg-primary px-6 py-3 rounded-xl shadow-lg shadow-primary/20 min-w-[140px]">
            <span className="text-xs font-medium text-blue-100 uppercase tracking-wider">Target Band</span>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-white">8.0</span>
              <span className="text-xs font-medium text-blue-200 mb-1">Oct 15</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Headphones} title="Listening" score="7.5" trend="up" trendLabel="Consistent" color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={BookOpen} title="Reading" score="8.0" trend="flat" trendLabel="Stable" color="text-teal-600" bg="bg-teal-50" />
        <StatCard icon={PenTool} title="Writing" score="6.5" trend="down" trendLabel="Needs Focus" color="text-orange-600" bg="bg-orange-50" />
        <StatCard icon={Mic} title="Speaking" score="7.0" trend="up" trendLabel="Improving" color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                Today's Study Plan
              </h3>
              <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Edit Plan</button>
            </div>
            <div className="p-2">
              <TaskItem type="Listening" time="15 mins" title="Section 1 - Conversation Practice" link="/listening" />
              <TaskItem type="Reading" time="20 mins" title="Academic Reading: Passage 2 Analysis" link="/mock-tests" />
              <TaskItem type="Writing" time="10 mins" title="Task 2: Essay Planning & Structure" link="/writing" />
              <TaskItem type="Speaking" time="10 mins" title="Part 2: Cue Card Practice (Travel)" link="/speaking" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             <div className="flex items-center gap-4 relative z-10">
               <div className="bg-white/10 p-3 rounded-lg">
                 <MessageSquare size={24} />
               </div>
               <div>
                 <h4 className="font-bold text-lg">Join the discussion</h4>
                 <p className="text-slate-300 text-sm">34 students are discussing "Task 2: Environmental Issues"</p>
               </div>
             </div>
             <button className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors whitespace-nowrap relative z-10">
                View Thread
             </button>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-primary rounded-xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>
             <div className="relative z-10">
               <div className="flex items-start justify-between mb-4">
                 <h3 className="font-bold text-xl leading-tight">Ready for a challenge?</h3>
               </div>
               <p className="text-blue-100 text-sm mb-6">Take a full length mock test to evaluate your current standing before the exam.</p>
               <Link to="/mock-tests/4/result" className="w-full bg-white text-primary font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                  Start Full Mock Test
                  <ArrowRight size={16} />
               </Link>
             </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Vocabulary</h3>
              <Link to="/vocabulary" className="text-xs font-medium text-primary hover:underline">View All</Link>
            </div>
            <div className="flex items-center gap-4 mb-6">
               <div className="relative w-16 h-16 flex-none">
                 <svg className="w-full h-full transform -rotate-90">
                   <circle className="text-slate-100" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="6"></circle>
                   <circle className="text-teal-500" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="52.7" strokeLinecap="round" strokeWidth="6"></circle>
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-xs font-bold text-slate-700">70%</span>
                 </div>
               </div>
               <div>
                 <p className="text-sm font-bold text-slate-900">Mastered Words</p>
                 <p className="text-xs text-slate-500">You've learned 35 new words this week.</p>
               </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
               <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Word of the Day</p>
               <div className="flex justify-between items-start">
                 <div>
                   <p className="text-lg font-bold text-slate-900">Ubiquitous</p>
                   <p className="text-sm text-slate-500 italic">adj. present, appearing, or found everywhere.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};