import { useNavigate } from "react-router";
import { ArrowLeft, Package, MapPin, User, Clock, Bot, XCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

type TaskStatus = "pending" | "inProgress" | "arrived" | "completed";

interface Task {
  id: string;
  product: {
    model: string;
    color: string;
    size: string;
    location: string;
  };
  destination: string;
  requester: string;
  status: TaskStatus;
  robotId?: string;
  createdAt: string;
}

// Mock 작업 데이터
const mockTasks: Task[] = [
  {
    id: "TASK001",
    product: {
      model: "Nike Air Max 270",
      color: "블랙/화이트",
      size: "270",
      location: "A-3-12",
    },
    destination: "매장 1번 카운터",
    requester: "김철수",
    status: "arrived",
    robotId: "ROBOT-01",
    createdAt: new Date().toISOString(),
  },
  {
    id: "TASK002",
    product: {
      model: "Adidas Ultraboost 22",
      color: "네이비",
      size: "265",
      location: "B-2-08",
    },
    destination: "매장 2번 카운터",
    requester: "이영희",
    status: "inProgress",
    robotId: "ROBOT-02",
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "TASK003",
    product: {
      model: "Puma RS-X",
      color: "레드/블랙",
      size: "275",
      location: "C-1-05",
    },
    destination: "매장 3번 카운터",
    requester: "박민수",
    status: "pending",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

export function TaskStatus() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[0]);

  useEffect(() => {
    // 실시간 상태 업데이트 시뮬레이션
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.status === "pending" && Math.random() > 0.7) {
            return { ...task, status: "inProgress" as TaskStatus, robotId: "ROBOT-0" + Math.floor(Math.random() * 5 + 1) };
          }
          if (task.status === "inProgress" && Math.random() > 0.8) {
            return { ...task, status: "arrived" as TaskStatus };
          }
          return task;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCancel = (taskId: string) => {
    if (confirm("이 요청을 취소하시겠습니까?")) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTask(null);
    }
  };

  const handleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: "completed" as TaskStatus } : t
      )
    );
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTask(null);
    }, 1000);
  };

  const getStatusInfo = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return { label: "대기 중", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
      case "inProgress":
        return { label: "진행 중", color: "bg-blue-100 text-blue-800 border-blue-300" };
      case "arrived":
        return { label: "도착 완료", color: "bg-green-100 text-green-800 border-green-300" };
      case "completed":
        return { label: "수령 완료", color: "bg-gray-100 text-gray-800 border-gray-300" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl">작업 상태</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 작업 목록 */}
          <div>
            <h2 className="text-xl mb-4">요청 내역 ({tasks.length})</h2>
            <div className="space-y-3">
              {tasks.map((task) => {
                const statusInfo = getStatusInfo(task.status);
                return (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`w-full text-left bg-white border-2 rounded-xl p-4 hover:border-indigo-600 transition-colors ${
                      selectedTask?.id === task.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm text-gray-600">{task.id}</div>
                        <div className="text-lg">{task.product.model}</div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm border ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{task.destination}</span>
                      {task.robotId && (
                        <span className="flex items-center gap-1">
                          <Bot className="w-4 h-4" />
                          {task.robotId}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {tasks.length === 0 && (
                <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                  진행 중인 작업이 없습니다
                </div>
              )}
            </div>
          </div>

          {/* 작업 상세 */}
          <div>
            <h2 className="text-xl mb-4">상세 정보</h2>
            {selectedTask ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
                {/* 요청 정보 */}
                <div>
                  <h3 className="text-lg mb-4">요청 정보</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-600">상품</div>
                        <div>
                          {selectedTask.product.model} / {selectedTask.product.color} /{" "}
                          {selectedTask.product.size}mm
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-600">목적지</div>
                        <div>{selectedTask.destination}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-600">요청자</div>
                        <div>{selectedTask.requester}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-600">요청 시간</div>
                        <div>
                          {new Date(selectedTask.createdAt).toLocaleString("ko-KR")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 상태 카드 */}
                <div>
                  <h3 className="text-lg mb-4">작업 상태</h3>
                  <div className="space-y-3">
                    <div
                      className={`border-2 rounded-lg p-4 ${
                        selectedTask.status === "pending"
                          ? "bg-yellow-50 border-yellow-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            selectedTask.status === "pending"
                              ? "bg-yellow-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span>대기 중</span>
                      </div>
                    </div>

                    <div
                      className={`border-2 rounded-lg p-4 ${
                        selectedTask.status === "inProgress"
                          ? "bg-blue-50 border-blue-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            selectedTask.status === "inProgress"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span>진행 중</span>
                      </div>
                      {selectedTask.robotId && (
                        <div className="mt-2 text-sm text-gray-600">
                          로봇: {selectedTask.robotId}
                        </div>
                      )}
                    </div>

                    <div
                      className={`border-2 rounded-lg p-4 ${
                        selectedTask.status === "arrived" ||
                        selectedTask.status === "completed"
                          ? "bg-green-50 border-green-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            selectedTask.status === "arrived" ||
                            selectedTask.status === "completed"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span>도착 완료</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  {selectedTask.status === "pending" && (
                    <button
                      onClick={() => handleCancel(selectedTask.id)}
                      className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      요청 취소
                    </button>
                  )}

                  {selectedTask.status === "arrived" && (
                    <button
                      onClick={() => handleComplete(selectedTask.id)}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      수령 완료
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center text-gray-500">
                작업을 선택해주세요
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
