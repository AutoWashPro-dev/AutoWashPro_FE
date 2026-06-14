export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">AutoWash Pro</h3>
          <p className="text-gray-400">Nền tảng quản lý và đặt lịch chăm sóc xe chuyên nghiệp.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Dịch vụ</h4>
          <ul className="space-y-2 text-gray-400">
            <li>Rửa xe tiêu chuẩn</li>
            <li>Detailing cao cấp</li>
            <li>Dọn nội thất</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Hỗ trợ</h4>
          <ul className="space-y-2 text-gray-400">
            <li>FAQ</li>
            <li>Chính sách bảo mật</li>
            <li>Điều khoản sử dụng</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Liên hệ</h4>
          <ul className="space-y-2 text-gray-400">
            <li>1900 1234</li>
            <li>support@autowashpro.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; 2026 AutoWash Pro. All rights reserved.</p>
      </div>
    </footer>
  );
}