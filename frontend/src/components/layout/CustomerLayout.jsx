import React, { useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, CreditCard, LogOut, Home, User, Sparkles } from 'lucide-react';

const CustomerLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Pesanan Saya', path: '/customer/bookings', icon: Calendar },
    { label: 'Riwayat Pembayaran', path: '/customer/payments', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                  B
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500">
                  Bookify
                </span>
              </Link>

              {/* Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Profile Actions */}
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary-200"
              >
                <Home size={14} /> Beranda
              </Link>

              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  <div className="w-7 h-7 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'Pelanggan'}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'Customer'}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Keluar Akun"
                >
                  <LogOut size={18} />
                </button>
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Bookify Customer Portal. All rights reserved.
      </footer>
    </div>
  );
};

export default CustomerLayout;
