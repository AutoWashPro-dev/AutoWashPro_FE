import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../app/store/authStore';

export default function LoginForm() {
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ name: 'User', email: 'user@example.com' });
    navigate('/customer/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1">
        <label className="text-[#181c1e] text-sm font-medium">Email</label>
        <input type="email" required placeholder="name@example.com" className="w-full border border-[#c3c6d6] rounded-lg px-4 py-3 focus:outline-none focus:border-[#003d9b] bg-white text-[#181c1e]" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[#181c1e] text-sm font-medium">Mật khẩu</label>
        <input type="password" required placeholder="••••••••" className="w-full border border-[#c3c6d6] rounded-lg px-4 py-3 focus:outline-none focus:border-[#003d9b] bg-white text-[#181c1e]" />
      </div>
      <div className="flex items-center justify-between mt-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="w-4 h-4 text-[#003d9b] border-[#c3c6d6] rounded" />
          <span className="text-sm text-[#434654]">Ghi nhớ</span>
        </label>
        <a href="#" className="text-sm text-[#003d9b] hover:underline font-medium">Quên mật khẩu?</a>
      </div>
      <button type="submit" className="bg-[#003d9b] text-white font-medium py-3 rounded-lg hover:bg-[#002f7a] transition shadow-sm mt-4">
        Đăng nhập
      </button>
      <div className="text-center text-sm text-[#434654] mt-4">
        Chưa có tài khoản? <Link to="/register" className="text-[#003d9b] font-medium hover:underline">Đăng ký ngay</Link>
      </div>
    </form>
  );
}
