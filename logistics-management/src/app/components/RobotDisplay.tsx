import { useState, useEffect } from "react";
import { Package, MapPin, CheckCircle, Loader2, Battery } from "lucide-react";

type DisplayStatus = "ready" | "delivering" | "arrived" | "returning" | "charging";

interface DisplayInfo {
  status: DisplayStatus;
  destination?: string;
  product?: string;
  progress?: number;
}

export function RobotDisplay() {
  const [displayInfo, setDisplayInfo] = useState<DisplayInfo>({
    status: "ready",
  });

  // 상태 변화 시뮬레이션 (데모용)
  useEffect(() => {
    const sequence: DisplayInfo[] = [
      { status: "ready" },
      {
        status: "delivering",
        destination: "매장 1번 카운터",
        product: "Nike Air Max 270",
        progress: 30,
      },
      {
        status: "delivering",
        destination: "매장 1번 카운터",
        product: "Nike Air Max 270",
        progress: 70,
      },
      {
        status: "arrived",
        destination: "매장 1번 카운터",
        product: "Nike Air Max 270",
      },
      { status: "returning", progress: 50 },
      { status: "charging" },
    ];

    let index = 0;
    const interval = setInterval(() => {
      setDisplayInfo(sequence[index]);
      index = (index + 1) % sequence.length;
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getStatusDisplay = () => {
    switch (displayInfo.status) {
      case "ready":
        return (
          <div className="text-center space-y-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-green-600 rounded-full">
              <CheckCircle className="w-20 h-20 text-white" />
            </div>
            <div>
              <div className="text-5xl mb-4">배송 준비 완료</div>
              <div className="text-3xl text-gray-300">출발 버튼을 눌러주세요</div>
            </div>
            <button className="bg-green-600 text-white px-16 py-6 rounded-2xl text-3xl hover:bg-green-700 transition-colors">
              배송 출발
            </button>
          </div>
        );

      case "delivering":
        return (
          <div className="text-center space-y-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-blue-600 rounded-full animate-pulse">
              <Loader2 className="w-20 h-20 text-white animate-spin" />
            </div>
            <div>
              <div className="text-5xl mb-4">배송 중</div>
              <div className="text-3xl text-gray-300 mb-6">
                목적지: {displayInfo.destination}
              </div>
              <div className="flex items-center gap-4 justify-center text-2xl text-gray-400">
                <Package className="w-8 h-8" />
                <span>{displayInfo.product}</span>
              </div>
            </div>
            <div className="w-full max-w-2xl mx-auto">
              <div className="h-6 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-1000"
                  style={{ width: `${displayInfo.progress || 0}%` }}
                ></div>
              </div>
              <div className="text-2xl text-gray-400 mt-3">
                {displayInfo.progress}% 완료
              </div>
            </div>
          </div>
        );

      case "arrived":
        return (
          <div className="text-center space-y-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-green-600 rounded-full">
              <MapPin className="w-20 h-20 text-white" />
            </div>
            <div>
              <div className="text-5xl mb-4">배송 완료</div>
              <div className="text-3xl text-gray-300 mb-2">
                {displayInfo.destination} 도착
              </div>
              <div className="flex items-center gap-4 justify-center text-2xl text-gray-400">
                <Package className="w-8 h-8" />
                <span>{displayInfo.product}</span>
              </div>
            </div>
            <button className="bg-green-600 text-white px-16 py-6 rounded-2xl text-3xl hover:bg-green-700 transition-colors">
              수령 확인
            </button>
          </div>
        );

      case "returning":
        return (
          <div className="text-center space-y-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-yellow-600 rounded-full">
              <Loader2 className="w-20 h-20 text-white animate-spin" />
            </div>
            <div>
              <div className="text-5xl mb-4">복귀 중</div>
              <div className="text-3xl text-gray-300">창고로 돌아가는 중입니다</div>
            </div>
            <div className="w-full max-w-2xl mx-auto">
              <div className="h-6 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-600 transition-all duration-1000"
                  style={{ width: `${displayInfo.progress || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        );

      case "charging":
        return (
          <div className="text-center space-y-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-purple-600 rounded-full animate-pulse">
              <Battery className="w-20 h-20 text-white" />
            </div>
            <div>
              <div className="text-5xl mb-4">충전 중</div>
              <div className="text-3xl text-gray-300">배터리를 충전하고 있습니다</div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-purple-600 rounded-full animate-bounce"></div>
              <div
                className="w-4 h-4 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-4 h-4 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-6xl aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border-4 border-gray-700 p-12 flex items-center justify-center">
        {getStatusDisplay()}
      </div>
    </div>
  );
}
