
import React, { useState, useEffect } from 'react';
import { Reward, UserRole } from '../types';
import { Icons } from '../constants.tsx';
import { db } from '../services/dbService';

interface RewardsViewProps {
  role: UserRole;
  points: number;
  studentId: string;
  onClaim: (cost: number, rewardTitle: string) => void;
}

const RewardsView: React.FC<RewardsViewProps> = ({ role, points, studentId, onClaim }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newReward, setNewReward] = useState({ title: '', cost: 100 });
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      if (studentId) {
        setLoading(true);
        const [rewData, dayData] = await Promise.all([
          db.getRewards(studentId),
          db.getCurrentDayInWeek(studentId)
        ]);
        setRewards(rewData);
        setCurrentDay(dayData);
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  const addReward = async () => {
    if (!newReward.title) return;
    setLoading(true);
    const reward: Reward = {
      id: Math.random().toString(36).substr(2, 9),
      title: newReward.title,
      cost: newReward.cost,
      isRedeemed: false,
      studentId: studentId
    };
    await db.saveReward(reward);
    setRewards([...rewards, reward]);
    setNewReward({ title: '', cost: 100 });
    setShowAdd(false);
    setLoading(false);
  };

  const redeemReward = async (id: string) => {
    const reward = rewards.find(r => r.id === id);
    if (currentDay < 7 && role === UserRole.STUDENT) {
      alert("عذراً! الجوائز تفتح فقط في اليوم السابع 🔒");
      return;
    }
    
    if (reward && points >= reward.cost && !reward.isRedeemed) {
      if (confirm(`استلام "${reward.title}"؟`)) {
        await onClaim(reward.cost, reward.title);
        await db.updateReward(id, { isRedeemed: true });
        setRewards(rewards.map(r => r.id === id ? { ...r, isRedeemed: true } : r));
      }
    }
  };

  const deleteReward = async (id: string) => {
    setLoading(true);
    await db.deleteReward(id);
    setRewards(rewards.filter(r => r.id !== id));
    setLoading(false);
  };

  const canManage = role === UserRole.PARENT || role === UserRole.INDEPENDENT;
  const isDaySeven = currentDay >= 7;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Progress */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-yellow-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">اليوم {currentDay} من 7</span>
          <span className={`text-[8px] font-black px-2 py-1 rounded-full ${isDaySeven ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {isDaySeven ? 'يوم الجائزة 🔓' : 'جاري العمل 🔒'}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-1000 ${isDaySeven ? 'bg-green-500' : 'bg-yellow-400'}`} style={{ width: `${(currentDay/7)*100}%` }} />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-gray-800">جوائز الأسبوع</h2>
        {canManage && (
          <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-green-600 text-white rounded-full shadow-lg"><Icons.Plus /></button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white p-4 rounded-3xl shadow-xl border animate-slideDown">
          <input type="text" placeholder="اسم الجائزة..." className="w-full p-3 border rounded-2xl mb-3 font-bold" value={newReward.title} onChange={(e) => setNewReward({...newReward, title: e.target.value})} />
          <input type="number" className="w-full p-2 border rounded-xl font-bold mb-3" value={newReward.cost} onChange={(e) => setNewReward({...newReward, cost: parseInt(e.target.value) || 0})} />
          <button onClick={addReward} className="w-full py-3 bg-green-600 text-white rounded-xl font-black shadow-lg">إضافة للجهاز السحابي للطالب</button>
        </div>
      )}

      {loading ? (
         <div className="text-center py-10 opacity-20 font-bold text-xs">جاري المزامنة...</div>
      ) : (
        <div className="space-y-3">
          {rewards.map(reward => (
            <div key={reward.id} className={`bg-white p-4 rounded-3xl border ${reward.isRedeemed ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <Icons.Trophy />
                   <h4 className="font-bold text-sm">{reward.title}</h4>
                </div>
                {canManage && !reward.isRedeemed && <button onClick={() => deleteReward(reward.id)} className="text-red-200"><Icons.Delete /></button>}
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs font-black text-yellow-600">💰 {reward.cost}</span>
                {role === UserRole.STUDENT && !reward.isRedeemed && (
                  <button 
                    disabled={points < reward.cost || !isDaySeven} 
                    onClick={() => redeemReward(reward.id)}
                    className={`px-6 py-1.5 rounded-xl font-black text-xs ${points >= reward.cost && isDaySeven ? 'bg-yellow-400' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {!isDaySeven ? '🔒 مغلق' : 'استلام'}
                  </button>
                )}
                {reward.isRedeemed && <span className="text-[10px] font-black text-green-500">تم الاستلام ✅</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RewardsView;
