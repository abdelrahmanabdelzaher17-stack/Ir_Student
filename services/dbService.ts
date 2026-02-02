
/**
 * Mock Cloud Database Service (Async-Ready).
 */

const STORAGE_KEYS = {
  USERS: 'iron_db_users',
  TASKS: 'iron_db_tasks',
  REWARDS: 'iron_db_rewards',
  DICT: 'iron_db_dictionary',
  CERTIFICATES: 'iron_db_certificates'
};

const delay = (ms = 500) => new Promise(res => setTimeout(res, ms));

const getItems = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setItems = (key: string, items: any[]) => localStorage.setItem(key, JSON.stringify(items));

const generateLinkCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const db = {
  // User operations
  getUser: async (id: string) => {
    await delay();
    return getItems(STORAGE_KEYS.USERS).find((u: any) => u.id === id);
  },
  
  saveUser: async (user: any) => {
    await delay();
    const users = getItems(STORAGE_KEYS.USERS);
    const idx = users.findIndex((u: any) => u.id === user.id);
    
    // Ensure student has a linkCode
    if (user.role === 'STUDENT' && !user.linkCode) {
      user.linkCode = generateLinkCode();
    }

    if (idx > -1) {
      users[idx] = { ...users[idx], ...user };
    } else {
      if (!user.weekStartDate) user.weekStartDate = Date.now();
      users.push(user);
    }
    setItems(STORAGE_KEYS.USERS, users);
    return user;
  },

  findUserByPhone: async (phone: string) => {
    await delay();
    const users = getItems(STORAGE_KEYS.USERS);
    return users.find((u: any) => u.phone === phone);
  },

  findUserByLinkCode: async (code: string) => {
    await delay();
    const users = getItems(STORAGE_KEYS.USERS);
    return users.find((u: any) => u.linkCode === code.toUpperCase());
  },

  // Weekly logic
  getCurrentDayInWeek: async (userId: string): Promise<number> => {
    const user = await db.getUser(userId);
    if (!user || !user.weekStartDate) return 1;
    const diffTime = Math.abs(Date.now() - user.weekStartDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return (diffDays % 7) + 1;
  },
  
  resetWeek: async (userId: string) => {
    await delay();
    const user = await db.getUser(userId);
    if (user) {
      user.weekStartDate = Date.now();
      await db.saveUser(user);
      const allTasks = getItems(STORAGE_KEYS.TASKS);
      const remainingTasks = allTasks.filter((t: any) => t.studentId !== userId);
      setItems(STORAGE_KEYS.TASKS, remainingTasks);
      
      const allRewards = getItems(STORAGE_KEYS.REWARDS);
      const remainingRewards = allRewards.filter((r: any) => r.studentId !== userId);
      setItems(STORAGE_KEYS.REWARDS, remainingRewards);
    }
  },

  // Task operations
  getTasks: async (studentId: string) => {
    await delay();
    return getItems(STORAGE_KEYS.TASKS).filter((t: any) => t.studentId === studentId);
  },
  
  saveTask: async (task: any) => {
    await delay();
    const tasks = getItems(STORAGE_KEYS.TASKS);
    tasks.push(task);
    setItems(STORAGE_KEYS.TASKS, tasks);
  },
  
  updateTask: async (taskId: string, updates: any) => {
    await delay();
    const tasks = getItems(STORAGE_KEYS.TASKS);
    const idx = tasks.findIndex((t: any) => t.id === taskId);
    if (idx > -1) {
      tasks[idx] = { ...tasks[idx], ...updates };
      setItems(STORAGE_KEYS.TASKS, tasks);
    }
  },
  
  deleteTask: async (taskId: string) => {
    await delay();
    const tasks = getItems(STORAGE_KEYS.TASKS).filter((t: any) => t.id !== taskId);
    setItems(STORAGE_KEYS.TASKS, tasks);
  },

  // Rewards
  getRewards: async (studentId: string) => {
    await delay();
    return getItems(STORAGE_KEYS.REWARDS).filter((r: any) => r.studentId === studentId);
  },
  
  saveReward: async (reward: any) => {
    await delay();
    const rewards = getItems(STORAGE_KEYS.REWARDS);
    rewards.push(reward);
    setItems(STORAGE_KEYS.REWARDS, rewards);
  },
  
  updateReward: async (rewardId: string, updates: any) => {
    await delay();
    const rewards = getItems(STORAGE_KEYS.REWARDS);
    const idx = rewards.findIndex((r: any) => r.id === rewardId);
    if (idx > -1) {
      rewards[idx] = { ...rewards[idx], ...updates };
      setItems(STORAGE_KEYS.REWARDS, rewards);
    }
  },
  
  deleteReward: async (id: string) => {
    await delay();
    const rewards = getItems(STORAGE_KEYS.REWARDS).filter((r: any) => r.id !== id);
    setItems(STORAGE_KEYS.REWARDS, rewards);
  },

  // Dictionary
  getDict: async (studentId: string) => {
    await delay();
    return getItems(STORAGE_KEYS.DICT).filter((d: any) => d.studentId === studentId);
  },
  
  saveDictEntry: async (entry: any) => {
    await delay();
    const dict = getItems(STORAGE_KEYS.DICT);
    dict.push(entry);
    setItems(STORAGE_KEYS.DICT, dict);
  },

  // Certificates
  getCertificates: async (studentId: string) => {
    await delay();
    return getItems(STORAGE_KEYS.CERTIFICATES).filter((c: any) => c.studentId === studentId);
  },

  saveCertificate: async (cert: any) => {
    await delay();
    const certs = getItems(STORAGE_KEYS.CERTIFICATES);
    certs.push(cert);
    setItems(STORAGE_KEYS.CERTIFICATES, certs);
    return cert;
  },

  deleteCertificate: async (id: string) => {
    await delay();
    const certs = getItems(STORAGE_KEYS.CERTIFICATES).filter((c: any) => c.id !== id);
    setItems(STORAGE_KEYS.CERTIFICATES, certs);
  }
};
