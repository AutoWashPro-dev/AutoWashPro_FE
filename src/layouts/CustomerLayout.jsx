import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function CustomerLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar isAuthenticated={true} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}