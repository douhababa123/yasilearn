import React from 'react';
import { History, Share2, Flame, Trophy, Lock } from 'lucide-react';

export const Achievement = () => {
  return (
    <div className="bg-[#f6f6f8] min-h-screen py-8 px-4 md:px-12 flex justify-center">
      <div className="max-w-[1200px] w-full flex flex-col gap-8">
        <div className="flex flex-col gap-2">
           <div className="flex gap-2 text-sm text-slate-500 items-center">
              <span>Home</span> <span className="text-xs">›</span> <span className="text-slate-900 font-medium">Achievement Center</span>
           </div>
           <div className="flex justify-between items-end">
              <div>
                 <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Achievement Center</h1>
                 <p className="text-slate-500">Keep pushing for that Band 7.5!</p>
              </div>
              <div className="flex gap-2">
                 <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50"><History size={16} /> History</button>
                 <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50"><Share2 size={16} /> Share Profile</button>
              </div>
           </div>
        </div>

        <div className="w-full bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-center md:items-start">
           <div className="flex gap-6 items-center flex-1">
              <div className="relative">
                 <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCs7He9mStSEDJ4ZNlFoMbTFT5MAnqw8e92bCvK1U5kzpBQ2h_GQtQKgp-gfF6TyjcCEcH2zyqSAiqqFtYC-HJP8bD30LmZBGgU8KxjPylW56FnJKBYm-dJsTHoQ5uc_NjCT9LSPQdip5JAdb1H7SMv1H7Ixsf5jcuCCQBS2A3986Ijw4BGQm7Z28yN2lk1Xv2rVWWHrPsUl_OhcGwbtnYEXJE1KtdI7TOEOysoT54HTkzY5lloXhE6ni51eV2xKYukf7DPxL_s0HI" className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover" alt="Avatar" />
                 <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-slate-900 p-1.5 rounded-full border-4 border-white shadow-sm font-bold text-xs"><Trophy size={20} fill="currentColor" /></div>
              </div>
              <div>
                 <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-slate-900">Level 15: Grammar Master</h2>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary uppercase">Pro Member</span>
                 </div>
                 <p className="text-slate-500">Band 8 Aspirant • Member since 2023</p>
              </div>
           </div>
           
           <div className="flex flex-col gap-3 w-full md:w-5/12 justify-center py-2">
              <div className="flex justify-between items-end">
                 <p className="text-slate-900 text-sm font-bold uppercase tracking-wider">Current XP Progress</p>
                 <p className="text-slate-900 text-lg font-bold">12,450 <span className="text-slate-400 text-sm font-medium">/ 15,000 XP</span></p>
              </div>
              <div className="relative h-4 rounded-full bg-slate-100 overflow-hidden">
                 <div className="absolute h-full bg-gradient-to-r from-blue-600 to-primary w-[83%] rounded-full"></div>
              </div>
              <p className="text-slate-500 text-sm text-right">2,550 XP to Level 16</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-bold text-slate-900">Medal Collection</h3>
                 <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 cursor-pointer">All</span>
                    <span className="px-3 py-1 rounded-full text-slate-500 text-sm font-medium hover:bg-slate-100 cursor-pointer">Earned</span>
                    <span className="px-3 py-1 rounded-full text-slate-500 text-sm font-medium hover:bg-slate-100 cursor-pointer">Locked</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {[
                    { icon: Flame, color: 'orange', title: '7-Day Streak', sub: 'Consistency King' },
                    { icon: Trophy, color: 'yellow', title: 'Band 7.0', sub: 'Mock Exam' },
                 ].map((m, i) => (
                    <div key={i} className="flex flex-col items-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer">
                       <div className={`mb-3 p-3 rounded-full bg-${m.color}-100 text-${m.color}-500`}><m.icon size={32} fill="currentColor" /></div>
                       <h4 className="font-bold text-sm text-center">{m.title}</h4>
                       <p className="text-slate-400 text-xs text-center mt-1">{m.sub}</p>
                    </div>
                 ))}
                 {[1,2,3,4].map(i => (
                    <div key={i} className="flex flex-col items-center p-4 rounded-xl bg-slate-50 border border-slate-200 opacity-60 relative">
                       <Lock size={16} className="absolute top-2 right-2 text-slate-400" />
                       <div className="mb-3 p-3 rounded-full bg-slate-200 text-slate-400"><Trophy size={32} /></div>
                       <h4 className="font-bold text-sm text-slate-400 text-center">Locked</h4>
                       <p className="text-slate-400 text-xs text-center mt-1">Keep playing</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};