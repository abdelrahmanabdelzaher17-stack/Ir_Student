
import React, { useState, useEffect } from 'react';
import { Task, UserRole } from '../types';
import { Icons } from '../constants.tsx';
import { db } from '../services/dbService';

interface TasksViewProps {
  role: UserRole;
  studentId: string;
  onComplete: (points: number) => void;
}

const TasksView: React.FC<TasksViewProps> = ({ role, studentId, onComplete }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', points: 10, category: 'study' as any });

  useEffect(() => {
    const fetchTasks = async () => {
      if (studentId) {
        setLoading(true);
        try {
          const data = await db.getTasks(studentId);
          setTasks(data || []);
        } catch (error) {
          console.error("Failed to fetch tasks:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTasks();
  }, [studentId]);

  const addTask = async () => {
    if (!newTask.title || !studentId) return;
    setLoading(true);
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      points: newTask.points,
      category: newTask.category,
      completed: false,
      studentId: studentId
    };
    try {
      await db.saveTask(task);
      setTasks(prev => [task, ...prev]);
      setNewTask({ title: '', points: 10, category: 'study' });
      setShowAdd(false);
    } catch (error) {
      alert("تعذر إضافة المهمة.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id: string) => {
    if (role === UserRole.PARENT) {
      alert("عذراً، الطالب فقط هو من يستطيع تأكيد إتمام المهمة.");
      return;
    }

    const t = tasks.find(x => x.id === id);
    if (t && !t.completed) {
      onComplete(t.points);
      await db.updateTask(id, { completed: true });
      setTasks(tasks.map(x => x.id === id ? { ...x, completed: true } : x));
    }
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    // نمنع الحدث من الوصول للعنصر الأب (toggleTask)
    e.preventDefault();
    e.stopPropagation();

    const isConfirmed = window.confirm("هل أنت متأكد من حذف هذه المهمة نهائياً من حساب الطالب؟");
    if (!isConfirmed) return;

    try {
      // الحذف من قاعدة البيانات أولاً
      await db.deleteTask(taskId);
      // تحديث الحالة المحلية فوراً
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("حدث خطأ أثناء محاولة الحذف.");
    }
  };

  const canManage = role === UserRole.PARENT || role === UserRole.INDEPENDENT;

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-black text-gray-800">المهام الدراسية</h2>
          {role === UserRole.PARENT && <p className="text-[9px] text-blue-500 font-bold italic">أنت الآن تدير مهام الطالب عبر السحابة</p>}
        </div>
        {canManage && (
          <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-blue-600 text-white rounded-full shadow-lg transition-transform active:scale-90">
            <Icons.Plus />
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white p-4 rounded-3xl shadow-xl border animate-slideDown">
          <input type="text" placeholder="اسم المهمة..." className="w-full p-3 border rounded-2xl mb-3 focus:outline-none font-bold" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
          <div className="flex gap-2 mb-3 text-xs">
            <input type="number" className="w-20 p-2 border rounded-xl font-bold" value={newTask.points} onChange={(e) => setNewTask({...newTask, points: parseInt(e.target.value) || 0})} />
            <select className="flex-1 p-2 border rounded-xl font-bold" value={newTask.category} onChange={(e) => setNewTask({...newTask, category: e.target.value as any})}>
              <option value="study">مذاكرة</option>
              <option value="worship">عبادة</option>
              <option value="habit">عادة</option>
            </select>
          </div>
          <button onClick={addTask} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg">إرسال المهمة للطالب 🚀</button>
        </div>
      )}

      {loading && tasks.length === 0 ? (
        <div className="flex flex-col items-center py-10 opacity-30">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold mt-2">جاري مزامنة البيانات...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-10 opacity-40">
              <p className="font-bold">لا توجد مهام حالية</p>
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                className={`bg-white p-4 rounded-3xl flex items-center gap-4 shadow-sm border transition-all ${task.completed ? 'bg-gray-50 border-gray-100 opacity-60' : 'hover:border-blue-200'}`}
              >
                {/* مساحة النقر للمهمة (التأكيد) */}
                <div 
                  onClick={() => toggleTask(task.id)}
                  className="flex flex-1 items-center gap-4 cursor-pointer"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500 shadow-sm' : 'border-gray-200 hover:border-blue-400'}`}>
                    {task.completed && <span className="text-white text-[10px]">✓</span>}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</h4>
                    <p className="text-[8px] font-black text-blue-500 uppercase">{task.points} نقطة</p>
                  </div>
                </div>

                {/* زر الحذف المنفصل تماماً */}
                {canManage && (
                  <button 
                    type="button"
                    onClick={(e) => handleDeleteTask(e, task.id)} 
                    className="p-3 -m-3 text-red-200 hover:text-red-600 transition-colors"
                    title="حذف المهمة"
                  >
                    <Icons.Delete />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TasksView;
