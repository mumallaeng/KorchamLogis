import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Package, Loader2 } from 'lucide-react';
import { storage } from '../data/mockData';

export default function Login() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 로그인 시뮬레이션 (0.5초 대기)
    setTimeout(() => {
      // Mock 사용자 정보 저장
      storage.saveUser({
        id: employeeId,
        name: employeeId === 'staff01' ? '김직원' : '이직원',
        employeeId: employeeId
      });

      setLoading(false);
      navigate('/main');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">물류 자동화 시스템</CardTitle>
            <CardDescription>직원 로그인</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">직원 ID</Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="staff01"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              로그인
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Demo: staff01 / staff02 (비밀번호 무관)
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
