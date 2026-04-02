import { useParams, useNavigate } from "react-router";
import { ArrowLeft, MapPin, Package, AlertCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

// 배송 가능한 위치 목록
const deliveryLocations = [
  "매장 1번 카운터",
  "매장 2번 카운터",
  "매장 3번 카운터",
  "매장 4번 카운터",
  "매장 5번 카운터",
  "고객 대기실",
  "VIP 룸",
];

// Mock 재고 데이터 (Inventory와 매칭)
const mockInventoryData: Record<string, any> = {
  INV001: {
    model: "Nike Air Max 270",
    color: "블랙/화이트",
    size: "270",
    location: "A-3-12",
    stock: 5,
  },
  INV002: {
    model: "Adidas Ultraboost 22",
    color: "네이비",
    size: "265",
    location: "B-2-08",
    stock: 0,
  },
  INV003: {
    model: "Puma RS-X",
    color: "레드/블랙",
    size: "275",
    location: "C-1-05",
    stock: 3,
  },
  INV004: {
    model: "New Balance 990v5",
    color: "그레이",
    size: "280",
    location: "A-1-23",
    stock: 8,
  },
  INV005: {
    model: "Converse Chuck 70",
    color: "화이트",
    size: "260",
    location: "D-2-15",
    stock: 0,
  },
  INV006: {
    model: "Vans Old Skool",
    color: "블랙",
    size: "265",
    location: "B-4-07",
    stock: 12,
  },
  INV007: {
    model: "Asics Gel-Kayano",
    color: "블루",
    size: "270",
    location: "C-3-19",
    stock: 0,
  },
  INV008: {
    model: "Reebok Club C",
    color: "화이트/그린",
    size: "275",
    location: "A-2-08",
    stock: 6,
  },
};

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requested, setRequested] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(deliveryLocations[0]);

  // ID가 INV로 시작하면 재고 데이터 사용, 아니면 랜덤 생성
  const product = id?.startsWith("INV") && mockInventoryData[id]
    ? mockInventoryData[id]
    : {
        model: "Nike Air Max 270",
        color: "블랙/화이트",
        size: "270",
        location: "A-3-12",
        stock: Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : 0,
      };

  const handleRequest = () => {
    // Mock 재고 요청
    setRequested(true);
    setTimeout(() => {
      alert("재고 입고 요청이 전송되었습니다.");
      navigate("/");
    }, 500);
  };

  const handleDeliveryRequest = () => {
    if (!selectedLocation) {
      alert("배송 위치를 선택해주세요.");
      return;
    }

    // 배송 요청 생성
    const taskId = "TASK" + Date.now();
    const username = localStorage.getItem("user") || "스태프";
    
    localStorage.setItem(
      taskId,
      JSON.stringify({
        id: taskId,
        product: product,
        destination: selectedLocation,
        requester: username,
        status: "pending",
        createdAt: new Date().toISOString(),
      })
    );
    
    alert(`${selectedLocation}으로 배송 요청이 생성되었습니다.`);
    navigate("/tasks");
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
          <h1 className="text-2xl">상품 상세 정보</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* QR 정보 */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
          <div className="text-sm text-indigo-900">스캔된 QR 코드</div>
          <div className="text-lg">{id}</div>
        </div>

        {/* 상품 정보 카드 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl mb-6">상품 정보</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">모델명</div>
                <div className="text-lg">{product.model}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">색상</div>
                <div className="text-lg">{product.color}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">사이즈</div>
                <div className="text-lg">{product.size}mm</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">보관 위치</div>
                <div className="text-lg">{product.location}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 재고 상태 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl mb-4">재고 상태</h2>

          {product.stock > 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="text-sm text-gray-600">재고 수량</div>
                  <div className="text-2xl text-green-700">{product.stock}개</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <div className="text-lg text-red-700">품절</div>
                  <div className="text-sm text-red-600">재고가 없습니다</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 배송 위치 선택 */}
        {product.stock > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl mb-4">배송 위치 선택</h2>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-4 bg-white border-2 border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
              >
                {deliveryLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="space-y-3">
          {product.stock === 0 && (
            <button
              onClick={handleRequest}
              disabled={requested}
              className="w-full bg-orange-600 text-white py-4 rounded-xl hover:bg-orange-700 transition-colors disabled:bg-gray-400"
            >
              {requested ? "재고 요청 완료" : "재고 입고 요청"}
            </button>
          )}

          {product.stock > 0 && (
            <button
              onClick={handleDeliveryRequest}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              배송 요청 생성
            </button>
          )}

          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 transition-colors"
          >
            메인으로 돌아가기
          </button>
        </div>
      </main>
    </div>
  );
}