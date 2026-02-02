
import React, { useState, useEffect, useRef } from 'react';
import { User, Certificate } from '../types';
import { db } from '../services/dbService';

interface CertificatesViewProps {
  user: User;
}

const CertificatesView: React.FC<CertificatesViewProps> = ({ user }) => {
  const [gradeInput, setGradeInput] = useState('');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'comfort' | null }>({ text: '', type: null });
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchCerts = async () => {
      const data = await db.getCertificates(user.id);
      setCertificates(data);
    };
    fetchCerts();
  }, [user.id]);

  const handleSubmitGrade = async () => {
    const grade = parseFloat(gradeInput);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      alert("يرجى إدخال درجة صحيحة بين 0 و 100");
      return;
    }

    setLoading(true);
    if (grade >= 90) {
      const newCert: Certificate = {
        id: Math.random().toString(36).substr(2, 9),
        studentName: user.name,
        grade: grade,
        date: Date.now(),
        studentId: user.id
      };
      await db.saveCertificate(newCert);
      setCertificates([newCert, ...certificates]);
      setFeedback({ text: `مبروك يا بطل! لقد حصلت على شهادة تقدير لدرجتك الرائعة (${grade}%)`, type: 'success' });
    } else {
      setFeedback({ 
        text: `لا تحزن يا بطل! ${grade}% درجة جيدة، والمهم هو المحاولة والتعلم. في المرة القادمة ستكون أفضل بالتأكيد، نحن نؤمن بك!`, 
        type: 'comfort' 
      });
    }
    setGradeInput('');
    setLoading(false);
  };

  const downloadCert = (cert: Certificate) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Drawing Certificate on Canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 600);
    
    // Border
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 20;
    ctx.strokeRect(20, 20, 760, 560);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 5;
    ctx.strokeRect(40, 40, 720, 520);

    // Text
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 40px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('شهادة تقدير وتفوق', 400, 120);
    
    ctx.fillStyle = '#4b5563';
    ctx.font = '24px Cairo, sans-serif';
    ctx.fillText('تمنح إدارة "التلميذ الحديدي" هذه الشهادة للبطل:', 400, 200);
    
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 48px Cairo, sans-serif';
    ctx.fillText(cert.studentName, 400, 280);
    
    ctx.fillStyle = '#4b5563';
    ctx.font = '24px Cairo, sans-serif';
    ctx.fillText(`تقديراً لاجتهاده وحصوله على درجة:`, 400, 360);
    
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 40px Cairo, sans-serif';
    ctx.fillText(`${cert.grade}%`, 400, 420);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px Cairo, sans-serif';
    const dateStr = new Date(cert.date).toLocaleDateString('ar-EG');
    ctx.fillText(`التاريخ: ${dateStr}`, 400, 500);

    // Download
    const link = document.createElement('a');
    link.download = `certificate-${cert.id}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const deleteCert = async (id: string) => {
    if (confirm("هل تريد مسح هذه الشهادة من الأرشيف؟")) {
      await db.deleteCertificate(id);
      setCertificates(certificates.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Grade Entry */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-50">
        <h3 className="font-black text-gray-800 text-lg mb-2">تسجيل درجة جديدة 📝</h3>
        <p className="text-xs text-gray-400 font-bold mb-4">أدخل درجتك المئوية لنرى ما إذا كنت تستحق الشهادة!</p>
        
        <div className="flex gap-2">
          <input 
            type="number" 
            placeholder="مثال: 95" 
            className="flex-1 p-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold text-center"
            value={gradeInput}
            onChange={(e) => setGradeInput(e.target.value)}
          />
          <button 
            onClick={handleSubmitGrade}
            disabled={loading}
            className="bg-blue-600 text-white px-8 rounded-2xl font-black shadow-lg active:scale-95 transition-all"
          >
            إرسال
          </button>
        </div>

        {feedback.text && (
          <div className={`mt-4 p-4 rounded-2xl border text-sm font-bold animate-slideDown ${feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
            <span className="flex items-center gap-2">
              {feedback.type === 'success' ? '🌟 ' : <img src="" alt="شعار" className="w-4 h-4 inline-block" />} 
              {feedback.text}
            </span>
          </div>
        )}
      </div>

      {/* Certificates Gallery */}
      <div className="space-y-4">
        <h3 className="font-black text-gray-800 text-lg">أرشيف شهاداتي 📜</h3>
        
        {certificates.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 opacity-50">
            <p className="font-bold text-gray-400">لا توجد شهادات حتى الآن.. اجتهد لتحصل على أول شهادة!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {certificates.map(cert => (
              <div key={cert.id} className="bg-white p-5 rounded-3xl shadow-md border-l-8 border-yellow-400 flex justify-between items-center group overflow-hidden relative">
                <div>
                  <h4 className="font-black text-blue-600 text-lg">شهادة تفوق ({cert.grade}%)</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">بتاريخ: {new Date(cert.date).toLocaleDateString('ar-EG')}</p>
                </div>
                <div className="flex gap-2 z-10">
                  <button 
                    onClick={() => downloadCert(cert)}
                    className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="تحميل كصورة"
                  >
                    💾
                  </button>
                  <button 
                    onClick={() => deleteCert(cert.id)}
                    className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title="مسح"
                  >
                    🗑️
                  </button>
                </div>
                {/* Background Decoration */}
                <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 grayscale group-hover:grayscale-0 transition-all rotate-12">🏆</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden Canvas for Certificate Generation */}
      <canvas ref={canvasRef} width="800" height="600" className="hidden" />
    </div>
  );
};

export default CertificatesView;
