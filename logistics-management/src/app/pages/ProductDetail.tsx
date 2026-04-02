import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, MapPin, Package, AlertCircle, Loader2 } from 'lucide-react';
import { storage, generateTaskId, getProductById } from '../data/mockData';
import type { Product, Task } from '../data/mockData';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState('매장 1층');

  useEffect(() => {
    if (productId) {
      const prod = getProductById(productId);
      if (prod) {
        setProduct(prod);
      } else {
        alert('상품을 찾을 수 없습니다.');
        navigate('/main');
      }
    }
  }, [productId, navigate]);

  const handleRequestStock = () => {
    if (!product) return;

    setLoading(true);

    // 작업 생성 시뮬레이션
    setTimeout(() => {
      const user = storage.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const newTask: Task = {
        id: generateTaskId(),
        productId: product.id,
        product: product,
        requester: user.name,
        destination: destination,
        status: 'waiting',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      storage.addTask(newTask);
      setLoading(false);

      // 작업 상태 화면으로 이동
      navigate(`/task/${newTask.id}`);
    }, 800);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">상품 상세</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* 상품 이미지 */}
        <Card className="overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.modelName}
            className="w-full h-64 object-cover"
          />
        </Card>

        {/* 상품 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{product.modelName}</span>
              {isOutOfStock ? (
                <Badge variant="destructive">품절</Badge>
              ) : (
                <Badge variant="default">재고 있음</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">색상</p>
                <p className="font-medium">{product.color}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">사이즈</p>
                <p className="font-medium">{product.size}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">보관 위치</p>
                <p className="font-medium">{product.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 재고 상태 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Package className="h-5 w-5 mr-2" />
              재고 상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isOutOfStock ? (
              <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">품절 상태</p>
                  <p className="text-sm text-red-700 mt-1">
                    로봇을 통해 재고를 요청하실 수 있습니다.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-900">
                  재고 수량: <span className="text-2xl">{product.stock}</span>개
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 재고 요청 */}
        {isOutOfStock && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">재고 요청</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="destination">목적지</Label>
                <Input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="예: 매장 1층"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleRequestStock}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                재고 요청하기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 재고가 있을 때도 요청 가능 (테스트용) */}
        {!isOutOfStock && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">목적지 (선택사항)</Label>
                  <Input
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="예: 매장 1층"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleRequestStock}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  로봇에게 배송 요청
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
