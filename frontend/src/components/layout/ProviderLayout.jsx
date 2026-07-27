import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, Calendar, Tag,
  LogOut, CalendarDays, Clock, DollarSign, ChevronRight
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const ProviderLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/provider/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Categories', path: '/provider/categories', icon: <Tag size={20} /> },
    { name: 'My Services', path: '/provider/services', icon: <Settings size={20} /> },
    { name: 'My Schedules', path: '/provider/schedules', icon: <CalendarDays size={20} /> },
    { name: 'My Slots', path: '/provider/slots', icon: <Clock size={20} /> },
    { name: 'Bookings', path: '/provider/bookings', icon: <Calendar size={20} /> },
    { name: 'Payments', path: '/provider/payments', icon: <DollarSign size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* Sidebar - Blue gradient untuk Provider, berbeda dari Admin */}
      <aside className="w-64 text-white flex flex-col fixed h-full z-20" style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #1a2e4a 60%, #0f1f33 100%)' }}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white leading-none">Bookify</span>
            <span className="text-xs font-semibold text-blue-300 tracking-wider uppercase">Provider Portal</span>
          </div>
        </div>

        {/* Provider Profile Badge */}
        <div className="mx-4 mt-4 p-3 bg-white/10 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-400 text-white rounded-full flex items-center justify-center font-bold text-lg uppercase flex-shrink-0">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white truncate">{user?.name}</div>
            <div className="text-xs text-blue-300">Provider</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-blue-200/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="font-medium flex-1">{item.name}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-blue-300 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col ml-64 min-h-screen relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex justify-end items-center px-8 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-slate-800">{user?.name}</div>
                <div className="text-xs text-blue-600 font-semibold">Provider</div>
              </div>
              <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold border-2 border-blue-200 uppercase text-sm">
                {user?.name?.charAt(0) || 'P'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <div className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProviderLayout;
