import { useNavigate } from "react-router";
import { QrCode, ClipboardList, Package, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export function Main() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [stats, setStats] = useState({
    pending: 3,
    inProgress: 2,
    completed: 15,
  });

  useEffect(() => {
    const username = localStorage.getItem("user");
    if (username) {
      setUser(username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleQRScan = () => {
    // QR 스캔 화면으로 이동
    navigate("/scan");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl">물류 로봇 시스템</h1>
            <p className="text-sm text-gray-600 mt-1">{user}님 환영합니다</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 작업 상태 요약 */}
        <div className="mb-8">
          <h2 className="text-xl mb-4">작업 상태 요약</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="text-3xl mb-2">{stats.pending}</div>
              <div className="text-gray-700">대기 중</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="text-3xl mb-2">{stats.inProgress}</div>
              <div className="text-gray-700">진행 중</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="text-3xl mb-2">{stats.completed}</div>
              <div className="text-gray-700">완료</div>
            </div>
          </div>
        </div>

        {/* 주요 기능 */}
        <div>
          <h2 className="text-xl mb-4">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleQRScan}
              className="bg-white border-2 border-indigo-600 rounded-xl p-8 hover:bg-indigo-50 transition-colors group"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-xl mb-1">QR 코드 스캔</div>
                  <div className="text-sm text-gray-600">
                    상품 정보 확인 및 요청
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/tasks")}
              className="bg-white border-2 border-gray-300 rounded-xl p-8 hover:border-indigo-600 hover:bg-indigo-50 transition-colors group"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:scale-110 transition-all">
                  <ClipboardList className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-xl mb-1">요청 내역</div>
                  <div className="text-sm text-gray-600">
                    작업 상태 확인 및 제어
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/inventory")}
              className="bg-white border-2 border-gray-300 rounded-xl p-8 hover:border-indigo-600 hover:bg-indigo-50 transition-colors group"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:scale-110 transition-all">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-xl mb-1">창고 재고 확인</div>
                  <div className="text-sm text-gray-600">전체 재고 상태 조회</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}