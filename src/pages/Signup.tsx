import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../services/authService';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signUp(email, password, fullName, phone);
      if (res.error) {
        alert('Đăng ký thất bại: ' + res.error.message);
      } else {
        alert('Đăng ký thành công. Vui lòng kiểm tra email để xác thực.');
        navigate('/dashboard');
      }
    } catch (err) {
      alert('Lỗi hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md p-6">
      <h2 className="mb-4 text-2xl font-bold">Đăng ký</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full justify-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </div>
      </form>
    </div>
  );
}
