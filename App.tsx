
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types.ts';
import { getRankInfo } from './constants.tsx';
import Dashboard from './components/Dashboard.tsx';
import Login from './components/Login.tsx';
import TasksView from './components/TasksView.tsx';
import RewardsView from './components/RewardsView.tsx';
import ToolsView from './components/ToolsView.tsx';
import SettingsView from './components/SettingsView.tsx';
import CertificatesView from './components/CertificatesView.tsx';
import { db } from './services/dbService.ts';
import { notificationService } from './services/notificationService.ts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeStudentData, setActiveStudentData] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'rewards' | 'tools' | 'settings' | 'certs'>('dashboard');
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    const initApp = async () => {
      try {
        const savedUserId = localStorage.getItem('iron_logged_id');
        if (savedUserId) {
          const user = await db.getUser(savedUserId);
          if (user) {
            setCurrentUser(user);
            if (user.role === UserRole.PARENT && user.linkedStudentId) {
              const student = await db.getUser(user.linkedStudentId);
              setActiveStudentData(student || null);
            } else {
              setActiveStudentData(user);
            }
          }
        }
      } catch (err) {
        console.error("Init Error:", err);
      }
    };
    initApp();

    const unsubscribe = notificationService.subscribe((title, body) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, title, body }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    });
    
    return () => {
       // Cleanup if needed
    };
  }, []);

  const handleLogin = async (user: User) => {
    await db.saveUser(user);
    localStorage.setItem('iron_logged_id', user.id);
    setCurrentUser(user);
    if (user.role === UserRole.PARENT && user.linkedStudentId) {
      const student = await db.getUser(user.linkedStudentId);
      setActiveStudentData(student || null);
    } else {
      setActiveStudentData(user);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('iron_logged_id');
    setCurrentUser(null);
    setActiveStudentData(null);
  };

  const updatePoints = async (amount: number, targetId?: string) => {
    const uid = targetId || currentUser?.id;
    if (!uid) return;
    const userToUpdate = await db.getUser(uid);
    if (!userToUpdate) return;
    
    const newPoints = (userToUpdate.points || 0) + amount;
    const rankInfo = getRankInfo(newPoints);
    const updated = { ...userToUpdate, points: newPoints, rank: rankInfo.rank };
    await db.saveUser(updated);
    
    if (currentUser?.id === uid) setCurrentUser(updated);
    if (activeStudentData?.id === uid) setActiveStudentData(updated);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 font-['Cairo']" dir="rtl">
      {/* Toasts */}
      <div className="fixed top-4 left-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-xl shadow-lg border-r-4 border-blue-500 pointer-events-auto animate-bounce">
            <h4 className="font-bold text-xs text-blue-800">{String(t.title)}</h4>
            <p className="text-[10px] text-gray-500">{String(t.body)}</p>
          </div>
        ))}
      </div>

      <header className="p-4 bg-white shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">{currentUser.name ? currentUser.name[0] : '؟'}</div>
          <span className="font-bold text-sm text-gray-700">{currentUser.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-yellow-600 font-black">✨ {activeStudentData?.points || 0}</span>
          <button onClick={handleLogout} className="text-gray-400 p-1">🚪</button>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'dashboard' && <Dashboard user={activeStudentData || currentUser} currentUserRole={currentUser.role} tasksCount={0} rewardsCount={0} onNavigate={setActiveTab} />}
        {activeTab === 'tasks' && <TasksView role={currentUser.role} studentId={activeStudentData?.id || ''} onComplete={updatePoints} />}
        {activeTab === 'rewards' && <RewardsView role={currentUser.role} points={activeStudentData?.points || 0} studentId={activeStudentData?.id || ''} onClaim={(c, t) => updatePoints(-c, activeStudentData?.id)} />}
        {activeTab === 'tools' && <ToolsView userRole={currentUser.role} studentId={activeStudentData?.id || ''} />}
        {activeTab === 'certs' && <CertificatesView user={activeStudentData || currentUser} />}
        {activeTab === 'settings' && <SettingsView user={currentUser} setUser={setCurrentUser} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 transition-all ${activeTab === 'dashboard' ? 'text-blue-600 scale-125' : 'text-gray-300'}`}>🏠</button>
        <button onClick={() => setActiveTab('tasks')} className={`p-2 transition-all ${activeTab === 'tasks' ? 'text-blue-600 scale-125' : 'text-gray-300'}`}>📋</button>
        <button onClick={() => setActiveTab('rewards')} className={`p-2 transition-all ${activeTab === 'rewards' ? 'text-blue-600 scale-125' : 'text-gray-300'}`}>🎁</button>
        <button onClick={() => setActiveTab('tools')} className={`p-2 transition-all ${activeTab === 'tools' ? 'text-blue-600 scale-125' : 'text-gray-300'}`}>📿</button>
        <button onClick={() => setActiveTab('settings')} className={`p-2 transition-all ${activeTab === 'settings' ? 'text-blue-600 scale-125' : 'text-gray-300'}`}>⚙️</button>
      </nav>
    </div>
  );
};

export default App;
