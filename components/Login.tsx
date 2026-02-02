
import React, { useState } from 'react';
import { User, UserRole, Rank } from '../types';
import { db } from '../services/dbService';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'welcome' | 'auth' | 'role'>('welcome');
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [userData, setUserData] = useState({ name: '', phone: '', password: '' });
  const [error, setError] = useState('');

  const handleNext = async () => {
    setError('');
    if (step === 'welcome') {
      setStep('auth');
      return;
    }

    if (step === 'auth') {
      if (!userData.phone || !userData.password) {
        setError('يرجى ملء كافة الحقول المطلوبة');
        return;
      }

      if (isLoginMode) {
        const existingUser = await db.findUserByPhone(userData.phone);
        if (existingUser) {
          if (userData.password === existingUser.password) { 
             onLogin(existingUser);
          } else {
            setError('كلمة المرور غير صحيحة، حاول مرة أخرى');
          }
        } else {
          setError('لم يتم العثور على حساب بهذا الرقم، هل تريد إنشاء حساب؟');
        }
      } else {
        if (!userData.name) {
          setError('يرجى إدخال اسمك');
          return;
        }
        if (userData.password.length < 4) {
          setError('كلمة المرور قصيرة جداً');
          return;
        }
        
        const userExists = await db.findUserByPhone(userData.phone);
        if (userExists) {
          setError('هذا الرقم مسجل بالفعل، جرب تسجيل الدخول');
          return;
        }

        setStep('role');
      }
    }
  };

  const selectRole = (role: UserRole) => {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name,
      phone: userData.phone,
      password: userData.password,
      role: role,
      points: 0,
      rank: Rank.BRONZE
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="max-w-sm w-full space-y-8 animate-fadeIn">
        
        {step === 'welcome' && (
          <div className="space-y-6">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden">
              <img src="\logo.png" alt="شعار التطبيق" className="w-full h-full object-contain p-2" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2 text-white drop-shadow-lg">التلميذ الحديدي</h1>
              <p className="text-blue-100 text-lg opacity-80 font-bold">رحلتك نحو التفوق والالتزام تبدأ هنا</p>
            </div>
            <div className="space-y-3 pt-4">
              <button 
                onClick={() => { setIsLoginMode(false); setStep('auth'); }}
                className="w-full bg-white text-blue-700 py-4 rounded-2xl font-black text-xl shadow-xl hover:bg-blue-50 transition-all active:scale-95"
              >
                إنشاء حساب بطل
              </button>
              <button 
                onClick={() => { setIsLoginMode(true); setStep('auth'); }}
                className="w-full bg-blue-500/20 text-white border-2 border-white/20 py-4 rounded-2xl font-black text-xl hover:bg-white/10 transition-all active:scale-95"
              >
                تسجيل الدخول
              </button>
            </div>
          </div>
        )}

        {step === 'auth' && (
          <div className="space-y-4 text-right animate-slideDown">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black">{isLoginMode ? 'مرحباً بعودتك' : 'انضم إلينا'}</h2>
              <p className="text-blue-200 text-xs mt-1 font-bold">
                {isLoginMode ? 'أدخل بياناتك للمتابعة' : 'املأ البيانات لتصبح تلميذاً حديدياً'}
              </p>
            </div>

            <div className="space-y-4">
              {!isLoginMode && (
                <div>
                  <label className="block text-xs font-bold mb-1 mr-2 opacity-70">الاسم بالكامل</label>
                  <input 
                    type="text" 
                    className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 focus:outline-none focus:bg-white/20 transition-all text-white placeholder-blue-300/50"
                    placeholder="أحمد محمد"
                    value={userData.name}
                    onChange={e => setUserData({...userData, name: e.target.value})}
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold mb-1 mr-2 opacity-70">رقم الهاتف</label>
                <input 
                  type="tel" 
                  className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 focus:outline-none focus:bg-white/20 transition-all text-white placeholder-blue-300/50"
                  placeholder="01xxxxxxxxx"
                  value={userData.phone}
                  onChange={e => setUserData({...userData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 mr-2 opacity-70">كلمة المرور</label>
                <input 
                  type="password" 
                  className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 focus:outline-none focus:bg-white/20 transition-all text-white placeholder-blue-300/50"
                  placeholder="••••••••"
                  value={userData.password}
                  onChange={e => setUserData({...userData, password: e.target.value})}
                />
              </div>
            </div>

            {!isLoginMode && (
              <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl mt-4">
                <p className="text-[10px] text-red-200 font-bold leading-relaxed text-center">
                  ⚠️ تنبيه هام: يرجى حفظ كلمة المرور جيداً. لا توجد طريقة لاستعادة الحساب في حال نسيانها لضمان أقصى درجات الخصوصية.
                </p>
              </div>
            )}

            {error && <p className="text-red-300 text-xs text-center font-black animate-pulse bg-red-500/10 py-2 rounded-lg">{error}</p>}

            <button 
              onClick={handleNext}
              className="w-full bg-white text-blue-700 py-4 rounded-2xl font-black text-xl mt-4 shadow-xl active:scale-95 transition-all"
            >
              {isLoginMode ? 'تسجيل الدخول' : 'متابعة'}
            </button>

            <button 
              onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
              className="w-full text-blue-200 text-sm font-bold mt-2 hover:text-white transition-colors"
            >
              {isLoginMode ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
            </button>
            
            <button 
              onClick={() => setStep('welcome')}
              className="w-full text-white/50 text-xs font-bold mt-4 hover:text-white"
            >
              العودة للخلف
            </button>
          </div>
        )}

        {step === 'role' && (
          <div className="space-y-4 animate-slideDown">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black">ما هو دورك؟</h2>
              <p className="text-blue-200 text-xs mt-1 font-bold">اختر الطريقة التي ستستخدم بها التطبيق</p>
            </div>
            
            <RoleCard 
              title="طالب" 
              desc="أنفذ المهام، أتعلم عبر البطاقات وأجمع الجوائز" 
              icon="🎓" 
              onClick={() => selectRole(UserRole.STUDENT)} 
            />
            <RoleCard 
              title="ولي أمر" 
              desc="أراقب تقدم الأبناء، أضع المهام وأحفزهم بالجوائز" 
              icon="👨‍👩‍👧" 
              onClick={() => selectRole(UserRole.PARENT)} 
            />
            <RoleCard 
              title="مستقل" 
              desc="أنا المسؤول عن رحلتي التعليمية بالكامل" 
              icon="🦁" 
              onClick={() => selectRole(UserRole.INDEPENDENT)} 
            />
            
            <button 
              onClick={() => setStep('auth')}
              className="w-full text-white/50 text-xs font-bold mt-4 hover:text-white"
            >
              تعديل البيانات السابقة
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

const RoleCard: React.FC<{ title: string, desc: string, icon: string, onClick: () => void }> = ({ title, desc, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full bg-white/10 border border-white/20 p-5 rounded-3xl text-right flex gap-4 items-center hover:bg-white/20 transition-all group active:scale-95"
  >
    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-black text-lg">{title}</h3>
      <p className="text-[10px] text-blue-100 opacity-60 leading-tight">{desc}</p>
    </div>
  </button>
);

export default Login;
