import React, { useState, useEffect } from 'react';
import { Calendar, Target, TrendingUp, Clock, CheckCircle, BookOpen, Headphones, PenTool, Mic, Plus, Sparkles, ArrowRight, Loader2, Settings } from 'lucide-react';

interface StudyPlan {
  id: number;
  user_id: number;
  current_score: number;
  target_score: number;
  exam_date: string;
  daily_hours: number;
  created_at: string;
}

interface Task {
  id: number;
  plan_id: number;
  date: string;
  type: 'listening' | 'reading' | 'writing' | 'speaking' | 'vocabulary';
  title: string;
  description: string;
  duration_minutes: number;
  status: 'pending' | 'in_progress' | 'completed';
  completed_at?: string;
}

interface WeeklyProgress {
  day: string;
  tasksCompleted: number;
  totalTasks: number;
}

export const StudyPlan: React.FC = () => {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Setup form state
  const [currentScore, setCurrentScore] = useState(5.0);
  const [targetScore, setTargetScore] = useState(7.0);
  const [examDate, setExamDate] = useState('');
  const [dailyHours, setDailyHours] = useState(2);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const response = await fetch('/api/study-plan');
      if (response.ok) {
        const data = await response.json();
        setPlan(data.plan);
        setTasks(data.tasks || []);
        if (!data.plan) {
          setShowSetup(true);
        }
      }
    } catch (err) {
      console.error('Failed to load plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    if (!examDate) {
      alert('Please select your exam date');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/study-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScore,
          targetScore,
          examDate,
          dailyHours
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPlan(data.plan);
        setTasks(data.tasks);
        setShowSetup(false);
      }
    } catch (err) {
      console.error('Failed to generate plan:', err);
    } finally {
      setGenerating(false);
    }
  };

  const completeTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/study-plan/tasks/${taskId}/complete`, {
        method: 'POST'
      });

      if (response.ok) {
        setTasks(tasks.map(task =>
          task.id === taskId
            ? { ...task, status: 'completed', completed_at: new Date().toISOString() }
            : task
        ));
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => task.date === today);
  };

  const getWeekProgress = (): WeeklyProgress[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    return days.map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + index);
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => t.date === dateStr);
      return {
        day,
        tasksCompleted: dayTasks.filter(t => t.status === 'completed').length,
        totalTasks: dayTasks.length
      };
    });
  };

  const getDaysUntilExam = () => {
    if (!plan?.exam_date) return 0;
    const exam = new Date(plan.exam_date);
    const today = new Date();
    const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getScoreGap = () => {
    if (!plan) return 0;
    return plan.target_score - plan.current_score;
  };

  const getProgressPercentage = () => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'listening': return <Headphones size={16} className="text-blue-500" />;
      case 'reading': return <BookOpen size={16} className="text-green-500" />;
      case 'writing': return <PenTool size={16} className="text-purple-500" />;
      case 'speaking': return <Mic size={16} className="text-orange-500" />;
      default: return <BookOpen size={16} className="text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  // Setup Modal
  if (showSetup) {
    return (
      <div className="p-6 lg:p-10 flex flex-col gap-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Target className="text-primary" size={28} />
              Set Your Study Goals
            </h1>
            <p className="text-slate-500 mt-2">
              Tell us about your IELTS goals and we'll create a personalized study plan for you.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Current Score */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current IELTS Score
              </label>
              <div className="flex gap-2">
                {[4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0].map(score => (
                  <button
                    key={score}
                    onClick={() => setCurrentScore(score)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentScore === score
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {score.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Score */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target IELTS Score
              </label>
              <div className="flex gap-2">
                {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(score => (
                  <button
                    key={score}
                    onClick={() => setTargetScore(score)}
                    disabled={score <= currentScore}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      targetScore === score
                        ? 'bg-green-500 text-white'
                        : score <= currentScore
                        ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {score.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Exam Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Daily Hours */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Daily Study Hours
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(hours => (
                  <button
                    key={hours}
                    onClick={() => setDailyHours(hours)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      dailyHours === hours
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <button
              onClick={generatePlan}
              disabled={generating || !examDate}
              className="w-full py-3 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating your personalized plan...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate My Study Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Plan View
  const todayTasks = getTodayTasks();
  const weekProgress = getWeekProgress();
  const daysUntil = getDaysUntilExam();
  const progress = getProgressPercentage();

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar className="text-primary" size={32} />
            Study Plan
          </h1>
          <p className="text-slate-500 mt-1">
            Your personalized IELTS preparation roadmap
          </p>
        </div>
        <button
          onClick={() => setShowSetup(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Settings size={16} />
          Adjust Goals
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock size={20} className="text-blue-500" />
            </div>
            <span className="text-sm text-slate-500">Days Until Exam</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{daysUntil}</p>
          <p className="text-sm text-slate-500 mt-1">
            {plan?.exam_date ? new Date(plan.exam_date).toLocaleDateString() : '-'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Target size={20} className="text-green-500" />
            </div>
            <span className="text-sm text-slate-500">Score Goal</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {plan?.current_score?.toFixed(1)} → {plan?.target_score?.toFixed(1)}
          </p>
          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp size={14} />
            +{getScoreGap().toFixed(1)} needed
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CheckCircle size={20} className="text-purple-500" />
            </div>
            <span className="text-sm text-slate-500">Progress</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{progress}%</p>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock size={20} className="text-orange-500" />
            </div>
            <span className="text-sm text-slate-500">Daily Study</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{plan?.daily_hours || 0}h</p>
          <p className="text-sm text-slate-500 mt-1">per day</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={20} className="text-primary" />
              Today's Tasks
            </h2>
          </div>

          <div className="p-6">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto mb-3 text-green-300" />
                <p className="text-slate-500">All tasks completed for today!</p>
                <p className="text-sm text-slate-400 mt-1">Check back tomorrow for new tasks.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      task.status === 'completed'
                        ? 'bg-green-50 border-green-200'
                        : task.status === 'in_progress'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200 hover:border-primary/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      task.status === 'completed'
                        ? 'bg-green-100'
                        : task.status === 'in_progress'
                        ? 'bg-blue-100'
                        : 'bg-slate-100'
                    }`}>
                      {getTypeIcon(task.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        task.status === 'completed' ? 'text-green-700 line-through' : 'text-slate-900'
                      }`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-slate-500">{task.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} />
                          {task.duration_minutes} min
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : task.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {task.status === 'completed' ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => completeTask(task.id)}
                        className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              This Week
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {weekProgress.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className={`w-8 text-sm font-medium ${
                    day.day === ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]
                      ? 'text-primary'
                      : 'text-slate-500'
                  }`}>
                    {day.day}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        day.tasksCompleted === day.totalTasks && day.totalTasks > 0
                          ? 'bg-green-500'
                          : day.tasksCompleted > 0
                          ? 'bg-blue-500'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: day.totalTasks > 0 ? `${(day.tasksCompleted / day.totalTasks) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm text-slate-500 w-12 text-right">
                    {day.tasksCompleted}/{day.totalTasks}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h3 className="text-sm font-medium text-slate-700 mb-2">Tips</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Consistency is key to IELTS success</li>
                <li>• Practice all four skills daily</li>
                <li>• Review mistakes in your error bank</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowRight size={20} className="text-primary" />
            Upcoming Tasks
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks
              .filter(t => t.status === 'pending' && t.date > new Date().toISOString().split('T')[0])
              .slice(0, 6)
              .map(task => (
                <div key={task.id} className="p-4 border border-slate-200 rounded-lg hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(task.type)}
                    <span className="text-xs text-slate-500">
                      {new Date(task.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
