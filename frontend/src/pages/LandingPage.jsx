import React, { useState, useEffect, useContext } from 'react';
import { Calendar, Clock, Star, ChevronRight, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { serviceApi } from '../services/serviceApi';
import { AuthContext } from '../context/AuthContext';

const LandingPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await serviceApi.getAllServices();
        setServices(data.slice(0, 3)); // Ambil 3 service pertama untuk display di hero
      } catch (err) {
        console.error("Gagal mengambil data layanan", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glassmorphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500">
                Bookify
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-slate-600 hover:text-primary-600 transition-colors font-medium">Services</a>
              <a href="#providers" className="text-slate-600 hover:text-primary-600 transition-colors font-medium">Providers</a>
              
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-slate-700 font-medium border-r border-slate-300 pr-4">Halo, {user.name}</span>
                  {user.role === 'admin' || user.role === 'provider' ? (
                    <Link to="/admin" className="text-primary-600 font-medium hover:text-primary-700">Dashboard</Link>
                  ) : (
                    <Link to="/my-bookings" className="text-primary-600 font-medium hover:text-primary-700">My Bookings</Link>
                  )}
                  <button onClick={logout} className="text-slate-500 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                  <User size={18} />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Book Your Next <br />
            <span className="text-primary-600">Appointment</span> Easily.
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl">
            Discover premium services, view available schedules, and book your appointments in just a few clicks. Fast, reliable, and hassle-free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button className="bg-primary-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
              Book Now <ChevronRight size={20} />
            </button>
            <a href="#services" className="bg-white text-slate-700 px-8 py-3 rounded-full text-lg font-medium hover:bg-slate-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              Explore Services
            </a>
          </div>
        </div>
        
        <div className="flex-1 relative w-full max-w-md mx-auto md:max-w-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-200 to-purple-200 rounded-full blur-3xl opacity-50"></div>
          
          <div className="relative space-y-4">
            {loading ? (
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : services.length > 0 ? (
              services.map((service) => (
                <div key={service.id} className="bg-white p-5 rounded-3xl shadow-xl border border-slate-100 transform transition-transform hover:scale-105">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800">{service.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-1">{service.description}</p>
                    </div>
                    <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                      ${service.price}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Clock className="text-primary-500" size={16} />
                      <span>{service.duration} mins</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 text-center text-slate-500">
                Belum ada layanan tersedia.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Stats / Info */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-slate-900 mb-2">500+</div>
            <div className="text-slate-500">Premium Providers</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-slate-900 mb-2">10k+</div>
            <div className="text-slate-500">Happy Customers</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-slate-900 mb-2">4.9/5</div>
            <div className="text-slate-500">Average Rating</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
