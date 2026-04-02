import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ArrowLeft, User, MapPin, Package, Bot, CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';
import { storage } from '../data/mockData';
import type { Task } from '../data/mockData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

export default function TaskStatus() {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  useEffect(() => {
    if (!taskId) return;

    // 작업 로드
    const loadTask = () => {
      const tasks = storage.getTasks();
      const found = tasks.find(t => t.id === taskId);
      if (found) {
        setTask(found);
      } else {
        alert('작업을 찾을 수 없습니다.');
        navigate('/main');
      }
    };

    loadTask();

    // 작업 상태 시뮬레이션 (실제로는 WebSocket 등으로 실시간 업데이트)
    const interval = setInterval(() => {
      const tasks = storage.getTasks();
      const currentTask = tasks.find(t => t.id === taskId);
      
      if (currentTask && currentTask.status === 'waiting') {
        // 5초 후 자동으로 진행중으로 변경
        const elapsed = Date.now() - currentTask.createdAt.getTime();
        if (elapsed > 5000) {
          storage.updateTask(taskId, {
            status: 'in_progress',
            robotId: `ROBOT-${Math.floor(Math.random() * 5) + 1}`
          });
          loadTask();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [taskId, navigate]);

  const handleCancel = () => {
    if (!taskId) return;
    storage.updateTask(taskId, { status: 'cancelled' });
    setShowCancelDialog(false);
    navigate('/main');
  };

  const handleComplete = () => {
    if (!taskId) return;
    storage.updateTask(taskId, { status: 'completed' });
    setShowCompleteDialog(false);
    
    // 재고 증가 (시뮬레이션)
    if (task) {
      const currentStock = task.product.stock;
      storage.updateProductStock(task.product.id, currentStock + 1);
    }
    
    setTimeout(() => {
      navigate('/main');
    }, 500);
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  const getProgressValue = () => {
    if (task.status === 'waiting') return 33;
    if (task.status === 'in_progress') return 66;
    if (task.status === 'completed') return 100;
    return 0;
  };

  const getStatusColor = () => {
    if (task.status === 'waiting') return 'text-yellow-600';
    if (task.status === 'in_progress') return 'text-blue-600';
    if (task.status === 'completed') return 'text-green-600';
    if (task.status === 'cancelled') return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusText = () => {
    if (task.status === 'waiting') return '대기 중';
    if (task.status === 'in_progress') return '진행 중';
    if (task.status === 'completed') return '완료';
    if (task.status === 'cancelled') return '취소됨';
    return '알 수 없음';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">작업 상태</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 작업 ID */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">작업 ID</p>
            <p className="font-mono text-sm">{task.id}</p>
          </CardContent>
        </Card>

        {/* 상태 진행 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">진행 상태</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className={`text-3xl font-semibold ${getStatusColor()}`}>
                {getStatusText()}
              </div>
              <Progress value={getProgressValue()} className="mt-4" />
            </div>

            {/* 상태 단계 */}
            <div className="space-y-3">
              <div className={`flex items-center space-x-3 ${task.status === 'waiting' || task.status === 'in_progress' || task.status === 'completed' ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.status === 'waiting' || task.status === 'in_progress' || task.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">요청 접수</p>
                  <p className="text-xs text-gray-500">{task.createdAt.toLocaleString('ko-KR')}</p>
                </div>
              </div>

              <div className={`flex items-center space-x-3 ${task.status === 'in_progress' || task.status === 'completed' ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.status === 'in_progress' || task.status === 'completed' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  {task.status === 'in_progress' ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium">로봇 작업 중</p>
                  {task.robotId && (
                    <p className="text-xs text-gray-500">로봇: {task.robotId}</p>
                  )}
                </div>
              </div>

              <div className={`flex items-center space-x-3 ${task.status === 'completed' ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">배송 완료</p>
                  {task.status === 'completed' && (
                    <p className="text-xs text-gray-500">{task.updatedAt.toLocaleString('ko-KR')}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 요청 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">요청 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">요청자</p>
                <p className="font-medium">{task.requester}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-500">목적지</p>
                <p className="font-medium">{task.destination}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 상품 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Package className="h-5 w-5 mr-2" />
              상품 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <img
                src={task.product.imageUrl}
                alt={task.product.modelName}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-medium">{task.product.modelName}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {task.product.color} / {task.product.size}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  위치: {task.product.location}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 로봇 정보 (진행 중일 때) */}
        {task.status === 'in_progress' && task.robotId && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Bot className="h-8 w-8 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">로봇이 작업 중입니다</p>
                  <p className="text-sm text-blue-700">로봇 ID: {task.robotId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 액션 버튼 */}
        <div className="space-y-2">
          {task.status === 'waiting' && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              요청 취소
            </Button>
          )}

          {task.status === 'in_progress' && (
            <Button
              className="w-full"
              onClick={() => setShowCompleteDialog(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              수령 완료
            </Button>
          )}

          {task.status === 'completed' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/main')}
            >
              메인으로 돌아가기
            </Button>
          )}
        </div>
      </div>

      {/* 취소 확인 다이얼로그 */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>요청을 취소하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업을 취소하면 다시 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>돌아가기</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>취소하기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 수령 완료 확인 다이얼로그 */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상품을 수령하셨나요?</AlertDialogTitle>
            <AlertDialogDescription>
              수령 완료 처리를 하면 작업이 완료됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>아니오</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>예, 수령했습니다</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
