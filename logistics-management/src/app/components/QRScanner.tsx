import { useNavigate } from "react-router";
import { ArrowLeft, Camera, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";

export function QRScanner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    // 카메라 시작 시뮬레이션
    setScanning(true);

    // 3초 후 자동으로 QR 코드 스캔 완료 시뮬레이션
    const timer = setTimeout(() => {
      const mockProductId = "PROD" + Math.floor(Math.random() * 1000);
      navigate(`/product/${mockProductId}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-700 rounded-lg text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl text-white">QR 코드 스캔</h1>
        </div>
      </header>

      {/* 카메라 화면 */}
      <main className="relative h-[calc(100vh-73px)] flex items-center justify-center">
        {/* 카메라 프리뷰 (Mock) */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
          {/* 격자 패턴으로 카메라 느낌 연출 */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 grid-rows-8 h-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="border border-gray-600"></div>
              ))}
            </div>
          </div>
        </div>

        {/* 스캔 영역 */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative">
            {/* 스캔 프레임 */}
            <div className="w-80 h-80 border-4 border-indigo-500 rounded-2xl relative">
              {/* 모서리 강조 */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-8 border-l-8 border-white rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 border-white rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 border-white rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-8 border-r-8 border-white rounded-br-2xl"></div>

              {/* 스캔 라인 애니메이션 */}
              {scanning && (
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-scan"></div>
                </div>
              )}

              {/* 카메라 아이콘 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white opacity-20">
                  <ScanLine className="w-32 h-32" />
                </div>
              </div>
            </div>
          </div>

          {/* 안내 텍스트 */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 text-white text-xl">
              <Camera className="w-6 h-6" />
              <span>QR 코드를 프레임 안에 맞춰주세요</span>
            </div>
            <div className="text-gray-400">자동으로 스캔됩니다...</div>
          </div>

          {/* 로딩 인디케이터 */}
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
