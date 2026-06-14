import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center py-24 px-4 bg-[#f7fafd] min-h-[calc(100vh-64px)]">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-[#c3c6d6] w-full max-w-md flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
          <span className="text-white font-bold text-2xl">A</span>
        </div>
        <h1 className="text-2xl font-bold text-[#181c1e] mb-2">Đăng nhập</h1>
        <p className="text-[#434654] text-center mb-8">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>
        
        <LoginForm />
      </div>
    </div>
  );
}