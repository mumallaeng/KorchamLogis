import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Camera, Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { storage } from '../data/mockData';

export default function QRScanner() {
  const navigate = useNavigate();
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // 실제 환경에서는 카메라 API를 사용하지만, 여기서는 시뮬레이션
  const handleScan = (productId: string) => {
    const products = storage.getProducts();
    const product = products.find(p => p.id === productId);
    
    if (product) {
      navigate(`/product/${productId}`);
    } else {
      alert('상품을 찾을 수 없습니다.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // QR 데이터 파싱 (SHOE-P001 형식)
    const productId = manualInput.startsWith('SHOE-') 
      ? manualInput.substring(5) 
      : manualInput;
    handleScan(productId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">QR 코드 스캔</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* QR 스캐너 화면 */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-square bg-gray-900 flex items-center justify-center">
              {/* 카메라 뷰 시뮬레이션 */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-50"></div>
              
              {/* 스캔 프레임 */}
              <div className="relative z-10 w-64 h-64 border-4 border-white rounded-lg">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                
                {/* 스캔 라인 애니메이션 */}
                <div className="absolute inset-x-0 h-0.5 bg-blue-500 animate-pulse" style={{ top: '50%' }}></div>
              </div>

              <div className="absolute bottom-4 left-0 right-0 text-center">
                <Camera className="mx-auto h-8 w-8 text-white mb-2" />
                <p className="text-white text-sm">QR 코드를 프레임 안에 맞춰주세요</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 수동 입력 옵션 */}
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowManualInput(!showManualInput)}
          >
            <Search className="mr-2 h-4 w-4" />
            수동으로 입력하기
          </Button>
        </div>

        {showManualInput && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qrCode">제품 코드 또는 QR 데이터</Label>
                  <Input
                    id="qrCode"
                    placeholder="예: P001 또는 SHOE-P001"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  조회하기
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 빠른 테스트 버튼 */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-3">빠른 테스트:</p>
            <div className="grid grid-cols-2 gap-2">
              {['P001', 'P002', 'P003', 'P004'].map(id => (
                <Button
                  key={id}
                  variant="outline"
                  onClick={() => handleScan(id)}
                >
                  {id}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
