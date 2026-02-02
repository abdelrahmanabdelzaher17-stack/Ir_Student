import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/dbService';
import { notificationService } from '../services/notificationService';

// 🛑🛑🛑 ضع رابط حساب InstaPay الخاص بك هنا 🛑🛑🛑
// Fix: Added explicit string type to allow comparison with other string literals and resolve type overlap error
const INSTAPAY_LINK: string = "https://ipn.eg/S/moh_zaher/instapay/334zld"; 
interface SettingsViewProps {
  user: User;
  setUser: (user: User) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, setUser }) => {
  const [linkCodeInput, setLinkCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // التقاط حدث تثبيت التطبيق
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const THEMES = [
    { id: 'system', name: 'الرتبة تلقائي', color: 'bg-gradient-to-r from-orange-400 to-cyan-400' },
    { id: 'light', name: 'كلاسيكي نظيف', color: 'bg-white border' },
    { id: 'dark', name: 'ليلي هادئ', color: 'bg-slate-900' },
    { id: 'ocean', name: 'محيط عميق', color: 'bg-blue-800' },
    { id: 'forest', name: 'غابة التركيز', color: 'bg-emerald-600' },
  ];

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("إذا كنت تستخدم iPhone، اضغط على زر 'مشاركة' ثم 'إضافة إلى الشاشة الرئيسية'. \nأما في Android، فالتطبيق مثبت بالفعل أو المتصفح لا يدعم.");
    }
  };

  const handleThemeChange = async (themeId: string) => {
    const updatedUser = { ...user, theme: themeId };
    await db.saveUser(updatedUser);
    setUser(updatedUser);
  };

  const handleLink = async () => {
    if (!linkCodeInput) return;
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const student = await db.findUserByLinkCode(linkCodeInput);
      if (student && student.role === UserRole.STUDENT) {
        const updatedParent = { ...user, linkedStudentId: student.id };
        await db.saveUser(updatedParent);
        setUser(updatedParent);
        setMessage({ text: `تم الربط بنجاح مع البطل: ${student.name}`, type: 'success' });
      } else {
        setMessage({ text: 'عذراً، لم نجد طالباً مسجلاً بهذا الكود!', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'حدث خطأ أثناء البحث عن الحساب.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReport = () => {
    const subject = encodeURIComponent("إبلاغ عن مشكلة في تطبيق التلميذ الحديدي");
    const body = encodeURIComponent(`مرحباً فريق الدعم،\n\nأود الإبلاغ عن:\n\nمعلومات المستخدم:\nالاسم: ${user.name}\nالهاتف: ${user.phone}`);
    window.location.href = `mailto:ironstudent.help@outlook.com?subject=${subject}&body=${body}`;
  };

  const resetMyWeek = async () => {
    if (confirm("هل تريد بدء أسبوع جديد؟ سيتم تصفير اليوم وحذف مهام الأسبوع الماضي.")) {
      await db.resetWeek(user.id);
      window.location.reload();
    }
  };

  const isStudent = user.role === UserRole.STUDENT;

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      
      {/* 0. كود الربط (للطالب فقط) */}
       {/* 0. PWA Install CTA */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100">
        <h3 className="font-black text-gray-800 text-lg mb-2">📲 تطبيق الهاتف</h3>
        <p className="text-xs text-gray-400 font-bold mb-4">ثبت التطبيق على هاتفك لتصل إليه بسرعة أكبر وبدون متصفح.</p>
        <button 
          onClick={handleInstallApp}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2"
        >
          <span>تثبيت التلميذ الحديدي</span>
          <span className="text-xl">📥</span>
        </button>
      </div>
      {isStudent && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-3xl shadow-xl text-white text-center">
          <h3 className="font-black text-sm mb-2 opacity-80">كود ربط الحساب 🔑</h3>
          <p className="text-3xl font-black tracking-widest bg-white/20 p-3 rounded-2xl border border-white/30">{user.linkCode || '---'}</p>
          <p className="text-[10px] font-bold mt-4 opacity-70 leading-relaxed">أعطِ هذا الكود لولي أمرك ليتمكن من متابعة تقدمك.</p>
        </div>
      )}

      {/* 1. اختيار الثيم */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-800 text-lg mb-4">🎨 مظهر التطبيق</h3>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`p-3 rounded-2xl flex items-center gap-3 border-2 transition-all ${user.theme === theme.id ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-gray-50'}`}
            >
              <div className={`w-6 h-6 rounded-full ${theme.color}`}></div>
              <span className="text-[10px] font-bold">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. ربط الحساب بالكود (لولي الأمر فقط) */}
      {user.role === UserRole.PARENT && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
          <h3 className="font-black text-gray-800 text-lg mb-2">🔗 ربط حساب الطالب</h3>
          <p className="text-xs text-gray-400 font-bold mb-4">أدخل "كود الربط" الموجود في تطبيق الطالب لمتابعته</p>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="مثال: A7B2X9" 
              className="w-full p-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-black text-center uppercase"
              value={linkCodeInput}
              onChange={(e) => setLinkCodeInput(e.target.value.toUpperCase())}
            />
            <button onClick={handleLink} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">
              {loading ? 'جاري التحقق...' : 'ربط الحساب آمن'}
            </button>
            {message.text && (
              <p className={`text-center font-bold text-[10px] p-2 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {message.text}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. الإشعارات والأسبوع */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-800 text-lg mb-4">⚙️ الإعدادات المتقدمة</h3>
        <div className="space-y-3">
          <button onClick={() => notificationService.test()} className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-2xl font-black border-2 border-indigo-100 flex items-center justify-center gap-3">
             🔔 اختبار الإشعارات
          </button>
          <button onClick={resetMyWeek} className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black border-2 border-red-100">
             🔄 بدء أسبوع جديد
          </button>
        </div>
      </div>

      {/* 4. التبرع عبر InstaPay */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-3xl shadow-xl text-white">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-black text-lg">💎 دعم عبر إنستا باي</h3>
          <span className="bg-white/20 px-2 py-0.5 rounded text-[8px] font-bold">InstaPay</span>
        </div>
        <p className="text-[10px] font-bold opacity-90 leading-relaxed mb-4">
          مساهمتك تساعدنا على البقاء وتطوير الميزات.
        </p>
        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border-2 border-yellow-300/50 mb-4 animate-pulse">
          <p className="text-[10px] font-black text-yellow-300 uppercase tracking-wider mb-1">⚠️ تنبيه هام جداً</p>
          <p className="text-xs font-black leading-tight text-white">يجب كتابة كلمة <span className="bg-yellow-400 text-rose-700 px-2 py-0.5 rounded-full">"تبرع"</span> في خانة الغرض (Reason) عند التحويل من تطبيق إنستا باي لضمان وصول الدعم.</p>
        </div>
        <button 
          onClick={handleInstaPay}
          className="w-full py-3 bg-white text-rose-600 rounded-xl font-black text-sm shadow-xl active:scale-95 transition-all"
        >
          فتح واجهة الدفع 🚀
        </button>
      </div>

      {/* 5. الإبلاغ */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-800 text-lg mb-2">📩 مساعدة وتقارير</h3>
        <button onClick={handleReport} className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-black border-2 border-gray-100 flex items-center justify-center gap-3">
           🛠️ إبلاغ عن مشكلة
        </button>
      </div>

      {/* 6. عن التطبيق */}
      <div className="bg-gray-100 p-8 rounded-[3rem] text-center space-y-4">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center overflow-hidden">
           <img src="\logo.png" alt="شعار التطبيق" className="w-full h-full object-contain p-2" />
        </div>
        <div>
          <h2 className="font-black text-gray-800 text-xl uppercase tracking-tighter">التلميذ الحديدي</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">الإصدار 1.1 Gold Edition</p>
        </div>
        <div className="pt-4 border-t border-gray-200">
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">مصممو ومطورو التطبيق</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-gray-600 border shadow-sm">عبدالرحمن محمد</span>
            <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-gray-600 border shadow-sm">ChatGPT (OpenAI)</span>
            <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-gray-600 border shadow-sm">Google Gemini</span>
          </div>
        </div>
        <p className="text-[9px] text-gray-400 font-bold px-6 leading-relaxed">
          جميع الحقوق محفوظة © 2025. التطبيق صُنع بحب لدعم مسيرة التعليم والالتزام.
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
