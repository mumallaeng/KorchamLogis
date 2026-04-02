import { useNavigate } from "react-router";
import {
  ArrowLeft,
  MapPin,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

interface InventoryItem {
  id: string;
  model: string;
  color: string;
  size: string;
  location: string;
  stock: number;
}

// Mock 재고 데이터
const mockInventory: InventoryItem[] = [
  {
    id: "INV001",
    model: "Nike Air Max 270",
    color: "블랙/화이트",
    size: "270",
    location: "A-3-12",
    stock: 5,
  },
  {
    id: "INV002",
    model: "Adidas Ultraboost 22",
    color: "네이비",
    size: "265",
    location: "B-2-08",
    stock: 0,
  },
  {
    id: "INV003",
    model: "Puma RS-X",
    color: "레드/블랙",
    size: "275",
    location: "C-1-05",
    stock: 3,
  },
  {
    id: "INV004",
    model: "New Balance 990v5",
    color: "그레이",
    size: "280",
    location: "A-1-23",
    stock: 8,
  },
  {
    id: "INV005",
    model: "Converse Chuck 70",
    color: "화이트",
    size: "260",
    location: "D-2-15",
    stock: 0,
  },
  {
    id: "INV006",
    model: "Vans Old Skool",
    color: "블랙",
    size: "265",
    location: "B-4-07",
    stock: 12,
  },
  {
    id: "INV007",
    model: "Asics Gel-Kayano",
    color: "블루",
    size: "270",
    location: "C-3-19",
    stock: 0,
  },
  {
    id: "INV008",
    model: "Reebok Club C",
    color: "화이트/그린",
    size: "275",
    location: "A-2-08",
    stock: 6,
  },
];

export function Inventory() {
  const navigate = useNavigate();
  const [inventory, setInventory] =
    useState<InventoryItem[]>(mockInventory);
  const [filter, setFilter] = useState<
    "all" | "inStock" | "outOfStock"
  >("all");
  const [requestedItems, setRequestedItems] = useState<
    Set<string>
  >(new Set());

  const handleRequest = (itemId: string) => {
    setRequestedItems((prev) => new Set(prev).add(itemId));
    setTimeout(() => {
      alert("재고 입고 요청이 전송되었습니다.");
    }, 300);
  };

  const filteredInventory = inventory.filter((item) => {
    if (filter === "inStock") return item.stock > 0;
    if (filter === "outOfStock") return item.stock === 0;
    return true;
  });

  const stats = {
    total: inventory.length,
    inStock: inventory.filter((i) => i.stock > 0).length,
    outOfStock: inventory.filter((i) => i.stock === 0).length,
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
          <h1 className="text-2xl">창고 재고 확인</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 재고 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-3xl mb-2">{stats.total}</div>
            <div className="text-gray-700">전체 상품</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="text-3xl mb-2">{stats.inStock}</div>
            <div className="text-gray-700">재고 있음</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-3xl mb-2">
              {stats.outOfStock}
            </div>
            <div className="text-gray-700">품절</div>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter("inStock")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "inStock"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            재고 있음
          </button>
          <button
            onClick={() => setFilter("outOfStock")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "outOfStock"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            품절
          </button>
        </div>

        {/* 재고 리스트 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">
                    모델명
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">
                    색상
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">
                    사이즈
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">
                    보관 위치
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">
                    재고 상태
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-700">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <span>{item.model}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {item.color}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {item.size}mm
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        {/* <MapPin className="w-4 h-4" /> */}
                        {item.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.stock > 0 ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-700">
                            {item.stock}개
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="text-red-700">
                            품절
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.stock > 0 ? (
                        <button
                          onClick={() =>
                            navigate(`/product/${item.id}`)
                          }
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          배송 요청
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRequest(item.id)}
                          disabled={requestedItems.has(item.id)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 text-sm"
                        >
                          {requestedItems.has(item.id)
                            ? "요청 완료"
                            : "재고 요청"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              해당하는 재고가 없습니다
            </div>
          )}
        </div>
      </main>
    </div>
  );
}