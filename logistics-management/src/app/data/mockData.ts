// Mock 데이터 타입 정의
export interface Product {
  id: string;
  modelName: string;
  color: string;
  size: string;
  location: string;
  stock: number;
  imageUrl: string;
}

export interface Task {
  id: string;
  productId: string;
  product: Product;
  requester: string;
  destination: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  robotId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  employeeId: string;
}

// Mock 상품 데이터
export const mockProducts: Product[] = [
  {
    id: 'P001',
    modelName: 'Nike Air Max 270',
    color: '블랙',
    size: '270',
    location: 'A-12-03',
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop'
  },
  {
    id: 'P002',
    modelName: 'Adidas Ultraboost',
    color: '화이트',
    size: '265',
    location: 'B-08-15',
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=300&fit=crop'
  },
  {
    id: 'P003',
    modelName: 'Puma RS-X',
    color: '레드',
    size: '275',
    location: 'C-05-22',
    stock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=300&fit=crop'
  },
  {
    id: 'P004',
    modelName: 'New Balance 990',
    color: '그레이',
    size: '280',
    location: 'A-15-08',
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=300&fit=crop'
  },
  {
    id: 'P005',
    modelName: 'Converse Chuck 70',
    color: '네이비',
    size: '260',
    location: 'D-03-11',
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400&h=300&fit=crop'
  },
  {
    id: 'P006',
    modelName: 'Vans Old Skool',
    color: '블랙/화이트',
    size: '270',
    location: 'B-11-19',
    stock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=300&fit=crop'
  },
  {
    id: 'P007',
    modelName: 'Reebok Classic',
    color: '화이트',
    size: '265',
    location: 'C-07-05',
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=300&fit=crop'
  },
  {
    id: 'P008',
    modelName: 'ASICS Gel-Kayano',
    color: '블루',
    size: '275',
    location: 'A-09-14',
    stock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop'
  }
];

// Local Storage 키
const STORAGE_KEYS = {
  TASKS: 'logistics_tasks',
  USER: 'logistics_user',
  PRODUCTS: 'logistics_products'
};

// Local Storage 헬퍼 함수
export const storage = {
  getTasks: (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!data) return [];
    return JSON.parse(data).map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }));
  },
  
  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },
  
  addTask: (task: Task) => {
    const tasks = storage.getTasks();
    tasks.push(task);
    storage.saveTasks(tasks);
  },
  
  updateTask: (taskId: string, updates: Partial<Task>) => {
    const tasks = storage.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date() };
      storage.saveTasks(tasks);
    }
  },
  
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  
  saveUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  
  clearUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      // 초기 데이터 설정
      storage.saveProducts(mockProducts);
      return mockProducts;
    }
    return JSON.parse(data);
  },
  
  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  
  updateProductStock: (productId: string, stock: number) => {
    const products = storage.getProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      products[index].stock = stock;
      storage.saveProducts(products);
    }
  }
};

// QR 코드에서 제품 ID 파싱 (시뮬레이션)
export const parseQRCode = (qrData: string): string | null => {
  // QR 데이터가 "SHOE-P001" 형식이라고 가정
  const match = qrData.match(/SHOE-(.+)/);
  return match ? match[1] : qrData;
};

// 제품 ID로 제품 정보 가져오기
export const getProductById = (productId: string): Product | undefined => {
  const products = storage.getProducts();
  return products.find(p => p.id === productId);
};

// 작업 ID 생성
export const generateTaskId = (): string => {
  return `T${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
