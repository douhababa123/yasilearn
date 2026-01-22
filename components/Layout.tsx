import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  FileText, 
  BookOpen, 
  Users, 
  Settings, 
  GraduationCap,
  Menu,
  Database
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <CalendarDays size={20} />, label: 'Study Plan', path: '/study-plan' },
    { icon: <FileText size={20} />, label: 'Mock Tests', path: '/mock-tests' },
    { icon: <BookOpen size={20} />, label: 'Vocabulary', path: '/vocabulary' },
    { icon: <GraduationCap size={20} />, label: 'Error Bank', path: '/error-bank' },
    { icon: <Users size={20} />, label: 'Community', path: '/community' },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-20 hidden lg:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">
          <GraduationCap size={20} />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">PrepMaster</h2>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-slate-100">
           <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Tools</p>
           <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <Database size={20} />
              <span className="text-sm">Data Import (ETL)</span>
            </NavLink>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="relative">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQGsDTSonjhC23BVSJrd5o3QhiguHWS-C4fGT6QRotMnI6fECh_9iytOcjjR3JNA_ggmzVXBP0AYO0-UYoFCJFgBaQfCxpJoAlkPg8UKSvi-LrtpbmBrx01pcnM0vsHSLgZuxWytIenHD3Or5PJeIHswqxdyOMAt1nlJ-wxR4jLMaEh6DMZZ9vWahPUQYLk6afyAbWXbZjj5riCGQ8fBKfJJoLPyjh9qLbs56VIpH7n7V_5Wz3jBpnrNaBYzerZ9pYxA-F-V7bmuM" 
              alt="Sarah Jenkins" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-bold text-slate-900">Sarah Jenkins</p>
            <p className="text-xs text-slate-500">IELTS Academic</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export const Layout = () => {
  return (
    <div className="flex min-h-screen bg-[#f6f6f8]">
      <Sidebar />
      <div className="flex-1 lg:ml-64 w-full">
        <Outlet />
      </div>
    </div>
  );
};
