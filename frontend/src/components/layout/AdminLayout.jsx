import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Settings,
  LogOut, Briefcase, ListOrdered, CalendarDays, Clock, DollarSign, TrendingUp
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Providers', path: '/admin/providers', icon: <Briefcase size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <ListOrdered size={20} /> },
    { name: 'Services', path: '/admin/services', icon: <Settings size={20} /> },
    { name: 'Schedules', path: '/admin/schedules', icon: <CalendarDays size={20} /> },
    { name: 'Slots', path: '/admin/slots', icon: <Clock size={20} /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <Calendar size={20} /> },
    { name: 'Payments', path: '/admin/payments', icon: <DollarSign size={20} /> },
    { name: 'Dynamic Pricing', path: '/admin/pricing', icon: <TrendingUp size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-2xl font-bold text-white">Bookify<span className="text-primary-500">Admin</span></span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
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
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-slate-800">{user?.name}</div>
                <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
              </div>
              <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold border border-primary-200 uppercase">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Outlet */}
        <div className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
