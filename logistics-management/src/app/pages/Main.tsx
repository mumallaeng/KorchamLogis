import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { QrCode, ClipboardList, Package, LogOut, Bot } from 'lucide-react';
import { storage } from '../data/mockData';
import type { User, Task } from '../data/mockData';

export default function Main() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const currentUser = storage.getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    // 작업 상태 로드
    const userTasks = storage.getTasks().filter(t => t.requester === currentUser.name);
    setTasks(userTasks);
  }, [navigate]);

  const handleLogout = () => {
    storage.clearUser();
    navigate('/login');
  };

  const getTaskStatusCounts = () => {
    const waiting = tasks.filter(t => t.status === 'waiting').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return { waiting, inProgress, completed };
  };

  const statusCounts = getTaskStatusCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">물류 자동화 시스템</h1>
            <p className="text-sm text-gray-500">{user?.name} ({user?.employeeId})</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 작업 상태 요약 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">작업 현황</CardTitle>
            <CardDescription>현재 진행 중인 작업 상태</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-semibold text-yellow-700">{statusCounts.waiting}</div>
              <div className="text-xs text-yellow-600 mt-1">대기중</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-semibold text-blue-700">{statusCounts.inProgress}</div>
              <div className="text-xs text-blue-600 mt-1">진행중</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-semibold text-green-700">{statusCounts.completed}</div>
              <div className="text-xs text-green-600 mt-1">완료</div>
            </div>
          </CardContent>
        </Card>

        {/* 주요 기능 버튼 */}
        <div className="space-y-3">
          <Button
            className="w-full h-20 text-lg"
            onClick={() => navigate('/qr-scanner')}
          >
            <QrCode className="mr-3 h-6 w-6" />
            QR 코드 스캔
          </Button>

          <Button
            variant="outline"
            className="w-full h-20 text-lg"
            onClick={() => navigate('/tasks')}
          >
            <ClipboardList className="mr-3 h-6 w-6" />
            요청 내역
            {(statusCounts.waiting + statusCounts.inProgress) > 0 && (
              <Badge className="ml-2" variant="default">
                {statusCounts.waiting + statusCounts.inProgress}
              </Badge>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full h-20 text-lg"
            onClick={() => navigate('/inventory')}
          >
            <Package className="mr-3 h-6 w-6" />
            창고 재고 확인
          </Button>

          <Button
            variant="secondary"
            className="w-full h-20 text-lg"
            onClick={() => navigate('/robot-lcd')}
          >
            <Bot className="mr-3 h-6 w-6" />
            로봇 LCD (데모)
          </Button>
        </div>

        {/* 최근 작업 */}
        {tasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">최근 작업</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate(`/task/${task.id}`)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{task.product.modelName}</div>
                    <div className="text-xs text-gray-500">{task.product.color} / {task.product.size}</div>
                  </div>
                  <Badge
                    variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'in_progress' ? 'secondary' :
                      task.status === 'cancelled' ? 'destructive' :
                      'outline'
                    }
                  >
                    {task.status === 'waiting' && '대기'}
                    {task.status === 'in_progress' && '진행중'}
                    {task.status === 'completed' && '완료'}
                    {task.status === 'cancelled' && '취소'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
