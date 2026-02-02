
import React, { useState, useEffect } from 'react';
import { DictionaryEntry, UserRole } from '../types';
import { getStudyTips, explainTerm } from '../services/geminiService';
import { db } from '../services/dbService';

interface ToolsViewProps {
  userRole: UserRole;
  studentId: string;
}

const ToolsView: React.FC<ToolsViewProps> = ({ userRole, studentId }) => {
  // لولي الأمر، الأداة الوحيدة المتاحة هي البطاقات للمراجعة
  const [activeTool, setActiveTool] = useState<'sebha' | 'dictionary' | 'ai'>(
    userRole === UserRole.PARENT ? 'dictionary' : 'sebha'
  );
  
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);
  
  // Fix: db.getDict is an async function, must be awaited inside a wrapper
  useEffect(() => {
    const fetchDictionary = async () => {
      if (studentId) {
        const data = await db.getDict(studentId);
        setDictionary(data);
      }
    };
    fetchDictionary();
  }, [studentId, activeTool]);

  const [count, setCount] = useState(0);
  const [newTerm, setNewTerm] = useState('');
  const [explaining, setExplaining] = useState(false);
  const [flipped, setFlipped] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [tips, setTips] = useState<string | null>(null);
  const [loadingTips, setLoadingTips] = useState(false);

  const addTerm = async () => {
    if (!newTerm || !studentId) return;
    setExplaining(true);
    const definition = await explainTerm(newTerm);
    const entry: DictionaryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      term: newTerm,
      definition: definition || 'لا يوجد تعريف متاح حالياً.',
      studentId: studentId,
      mastered: false
    };
    // Fix: Added await for saveDictEntry
    await db.saveDictEntry(entry);
    setDictionary([entry, ...dictionary]);
    setNewTerm('');
    setExplaining(false);
  };

  const fetchTips = async () => {
    if (!topic) return;
    setLoadingTips(true);
    const result = await getStudyTips(topic);
    setTips(result || "أنت مبدع، واصل المذاكرة!");
    setLoadingTips(false);
  };

  const isParent = userRole === UserRole.PARENT;
  const canAddCards = userRole === UserRole.STUDENT || userRole === UserRole.INDEPENDENT;

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* تبديل الأدوات يظهر فقط للطالب أو المستقل */}
      {!isParent && (
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border">
          <button onClick={() => setActiveTool('sebha')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTool === 'sebha' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>السبحة</button>
          <button onClick={() => setActiveTool('dictionary')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTool === 'dictionary' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>البطاقات</button>
          <button onClick={() => setActiveTool('ai')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeTool === 'ai' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>مساعد ذكي</button>
        </div>
      )}

      {activeTool === 'sebha' && !isParent && (
        <div className="text-center space-y-8 py-10">
          <div className="relative inline-block">
             <div className="w-48 h-48 rounded-full border-8 border-blue-50 flex flex-col items-center justify-center bg-white shadow-inner">
                <span className="text-5xl font-black text-blue-600">{count}</span>
                <span className="text-xs text-gray-400 font-bold mt-2 uppercase">تسبيحة</span>
             </div>
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={() => setCount(count + 1)} className="w-24 h-24 bg-blue-600 text-white rounded-full shadow-xl text-3xl font-bold flex items-center justify-center active:scale-95 transition-all">+</button>
            <button onClick={() => setCount(0)} className="w-24 h-24 bg-gray-100 text-gray-400 rounded-full shadow-inner flex items-center justify-center text-sm font-bold">تصفير</button>
          </div>
        </div>
      )}

      {activeTool === 'dictionary' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-blue-50 shadow-sm">
            <h3 className="font-black text-gray-800 text-lg mb-1">بطاقات المراجعة الذكية 📚</h3>
            <p className="text-[10px] text-gray-400 font-bold">
              {isParent ? "راجع المصطلحات التي قام الطالب بإضافتها وشرحها بالذكاء الاصطناعي." : "أضف أي مصطلح صعب وسيقوم الذكاء الاصطناعي بشرحه لك في بطاقة."}
            </p>
          </div>

          {canAddCards && (
            <div className="flex gap-2 animate-slideDown">
              <input 
                type="text" 
                placeholder="أضف كلمة صعبة..." 
                className="flex-1 p-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
              />
              <button onClick={addTerm} disabled={explaining} className="bg-blue-600 text-white px-6 rounded-2xl font-black disabled:opacity-50 transition-all active:scale-95 shadow-md">
                {explaining ? '...' : 'إضافة'}
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            {dictionary.length === 0 ? (
              <div className="text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 italic font-bold">لا توجد بطاقات تعليمية مضافة</p>
              </div>
            ) : (
              dictionary.map(entry => (
                <div 
                  key={entry.id} 
                  onClick={() => setFlipped(flipped === entry.id ? null : entry.id)}
                  className="h-44 relative perspective-1000 cursor-pointer group"
                >
                  <div className={`w-full h-full transition-all duration-700 transform-style-3d relative ${flipped === entry.id ? 'rotate-y-180' : ''}`}>
                    <div className="absolute inset-0 backface-hidden bg-white rounded-3xl border-2 border-blue-100 flex flex-col items-center justify-center p-6 shadow-sm group-hover:border-blue-300 transition-colors">
                       <span className="text-2xl font-black text-blue-600 text-center">{entry.term}</span>
                       <span className="text-[10px] text-gray-300 mt-4 font-bold border-t pt-2 w-full text-center">اضغط لعرض الشرح</span>
                    </div>
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center p-8 shadow-xl rotate-y-180 text-white">
                       <p className="text-sm font-bold text-center leading-relaxed italic">"{entry.definition}"</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTool === 'ai' && !isParent && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-black mb-1">المساعد الدراسي الذكي 🤖</h3>
              <p className="text-[10px] opacity-90 font-bold">اكتب مادة أو درساً وسأعطيك نصائح ذهبية للمذاكرة</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="مثال: مادة العلوم، التعبير..." className="flex-1 p-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold" value={topic} onChange={(e) => setTopic(e.target.value)}/>
            <button onClick={fetchTips} disabled={loadingTips} className="bg-purple-600 text-white px-6 rounded-2xl font-black shadow-lg transition-all active:scale-95">نصيحة</button>
          </div>
          {tips && <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-purple-100 animate-slideDown whitespace-pre-wrap text-gray-700 leading-relaxed text-sm font-bold">{tips}</div>}
        </div>
      )}
    </div>
  );
};

export default ToolsView;
