
import React from 'react';
import { User, Rank, UserRole } from '../types';
import { getRankInfo, RANK_THRESHOLDS } from '../constants';

interface DashboardProps {
  user: User; // This is the student being viewed
  currentUserRole: UserRole; // This is the role of the person logged in
  tasksCount: number;
  rewardsCount: number;
  onNavigate: (tab: 'tasks' | 'rewards' | 'tools') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, currentUserRole, tasksCount, rewardsCount, onNavigate }) => {
  const rankInfo = getRankInfo(user.points);
  const isParent = currentUserRole === UserRole.PARENT;
  
  const getProgress = () => {
    const ranks = Object.values(Rank);
    const currentIndex = ranks.indexOf(user.rank);
    if (currentIndex === ranks.length - 1) return 100;
    
    const nextRank = ranks[currentIndex + 1];
    const currentMin = RANK_THRESHOLDS[user.rank];
    const nextMin = RANK_THRESHOLDS[nextRank];
    
    const progress = ((user.points - currentMin) / (nextMin - currentMin)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Rank Progress Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-white/50 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-gray-500">
            {isParent ? `تقدم البطل ${user.name}` : 'تقدمك نحو الرتبة التالية'}
          </span>
          <span className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded bg-gray-100 ${rankInfo.color}`}>
            {rankInfo.label}
          </span>
        </div>
        
        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${rankInfo.rank === Rank.BRONZE ? 'bg-orange-600' : rankInfo.rank === Rank.SILVER ? 'bg-gray-400' : rankInfo.rank === Rank.GOLD ? 'bg-yellow-500' : 'bg-cyan-500'}`}
            style={{ width: `${getProgress()}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-bold">
          <span>{user.points} نقطة</span>
          <span>{user.rank === Rank.DIAMOND ? 'وصل للقمة!' : `${RANK_THRESHOLDS[Object.values(Rank)[Object.values(Rank).indexOf(user.rank) + 1]]} نقطة للرتبة التالية`}</span>
        </div>
      </div>

      {/* Quick Actions - Customized for Parent */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onNavigate('tasks')} className="bg-white p-5 rounded-3xl shadow-lg border border-transparent hover:border-blue-200 transition-all flex flex-col items-center group">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-2 group-hover:scale-110 transition-transform">
            📋
          </div>
          <span className="font-bold text-gray-700">{isParent ? 'إدارة المهام' : 'المهام'}</span>
        </button>

        <button onClick={() => onNavigate('rewards')} className="bg-white p-5 rounded-3xl shadow-lg border border-transparent hover:border-green-200 transition-all flex flex-col items-center group">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mb-2 group-hover:scale-110 transition-transform">
            🎁
          </div>
          <span className="font-bold text-gray-700">{isParent ? 'إدارة الجوائز' : 'الجوائز'}</span>
        </button>

        {/* Hide Sebha for Parent on Dashboard */}
        {!isParent ? (
          <button onClick={() => onNavigate('tools')} className="bg-white p-5 rounded-3xl shadow-lg border border-transparent hover:border-purple-200 transition-all flex flex-col items-center group">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 mb-2 group-hover:scale-110 transition-transform">
              📿
            </div>
            <span className="font-bold text-gray-700">السبحة</span>
          </button>
        ) : null}

        <button onClick={() => onNavigate('tools')} className={`bg-white p-5 rounded-3xl shadow-lg border border-transparent hover:border-orange-200 transition-all flex flex-col items-center group ${isParent ? 'col-span-2' : ''}`}>
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-2 group-hover:scale-110 transition-transform">
            📖
          </div>
          <span className="font-bold text-gray-700">{isParent ? 'مراجعة البطاقات التعليمية' : 'القاموس والبطاقات'}</span>
        </button>
      </div>

      {/* Daily Motivation Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 text-right">
          <h3 className="text-xl font-black mb-2">رسالة اليوم 🌟</h3>
          <p className="text-sm text-blue-100 opacity-90 leading-relaxed italic font-bold">
            {isParent 
              ? "دورك كمشرف هو الوقود الذي يحرك بطلنا الصغير. شجعه اليوم بكلمة طيبة!" 
              : "النجاح هو مجموع مجهودات صغيرة تتكرر كل يوم. كن التلميذ الحديدي الذي لا يلين!"}
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Dashboard;
