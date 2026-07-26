import React, { useState, useEffect, useContext } from 'react';
import { 
  Calendar, Clock, Star, ChevronRight, User, LogOut, 
  HelpCircle, ChevronDown, ChevronUp, CheckCircle, ShieldCheck, 
  Mail, Phone, MapPin, Sparkles, Filter, Award, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { serviceApi } from '../services/serviceApi';
import { categoryService } from '../services/categoryService';
import { AuthContext } from '../context/AuthContext';

const LandingPage = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [svcData, catData] = await Promise.all([
        serviceApi.getAllServices(),
        categoryService.getAllCategories()
      ]);
      
      setServices(svcData || []);
      setCategories(catData.data || catData || []);
    } catch (err) {
      console.error("Gagal mengambil data dari database", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(svc => Number(svc.category_id) === Number(selectedCategory));

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "Bagaimana cara memesan layanan di Bookify?",
      a: "Anda cukup memilih layanan yang diinginkan pada daftar layanan, klik 'Pesan Sekarang', lalu tentukan tanggal dan jam ketersediaan yang Anda inginkan. Sistem kami akan langsung mencatat reservasi Anda secara otomatis."
    },
    {
      q: "Apakah saya bisa membatalkan atau mengubah jadwal pesanan?",
      a: "Ya, Anda dapat membatalkan atau mengelola jadwal pesanan Anda melalui menu 'My Bookings' pada dashboard akun pelanggan Anda sebelum waktu pelayanan berlangsung."
    },
    {
      q: "Metode pembayaran apa saja yang didukung?",
      a: "Kami mendukung berbagai metode pembayaran fleksibel termasuk transfer bank, E-Wallet, Kartu Kredit/Debit, serta konfirmasi pembayaran langsung di tempat."
    },
    {
      q: "Bagaimana jika saya ingin mendaftar sebagai Penyedia Layanan (Provider)?",
      a: "Anda dapat melakukan registrasi akun dan memilih peran sebagai Provider, atau menghubungi tim support kami untuk memverifikasi profil bisnis dan mulai menawarkan layanan Anda."
    },
    {
      q: "Apakah ada biaya tambahan saat melakukan reservasi?",
      a: "Tidak ada biaya tersembunyi. Seluruh rincian biaya layanan dan aturan penetapan harga ditampilkan secara transparan sebelum Anda menyelesaikan konfirmasi pemesanan."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth">
      {/* 1. Navigation */}
      <nav className="fixed w-full z-50 glassmorphism bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                B
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500">
                Bookify
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-slate-600 hover:text-primary-600 transition-colors font-medium text-sm">Layanan</a>
              <a href="#faq" className="text-slate-600 hover:text-primary-600 transition-colors font-medium text-sm">FAQ</a>
              <a href="#contact" className="text-slate-600 hover:text-primary-600 transition-colors font-medium text-sm">Kontak</a>
              
              {user ? (
                <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                  <span className="text-slate-700 font-semibold text-sm">Halo, {user.name}</span>
                  {user.role === 'admin' || user.role === 'provider' ? (
                    <Link 
                      to={user.role === 'provider' ? '/provider/dashboard' : '/admin/dashboard'} 
                      className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors"
                    >
                      Dashboard Portal
                    </Link>
                  ) : (
                    <Link 
                      to="/customer/bookings" 
                      className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors"
                    >
                      Pesanan Saya
                    </Link>
                  )}
                  <button 
                    onClick={logout} 
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/login" 
                    className="text-slate-700 hover:text-primary-600 px-4 py-2 font-semibold text-sm transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg text-sm font-semibold flex items-center gap-2"
                  >
                    <User size={16} />
                    Daftar Bebas
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold mb-6">
            <Sparkles size={14} className="text-primary-600" />
            <span>Platform Reservasi Layanan Terpercaya #1</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
            Solusi Reservasi Layanan <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500">
              Terbaik & Bebas Antre.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl leading-relaxed">
            Temukan berbagai layanan berkualitas dari penyedia terpercaya. Pilih jadwal yang fleksibel dan pesan janji temu Anda dalam hitungan detik tanpa ribet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link 
              to={user ? "/customer/bookings" : "/login"} 
              className="bg-primary-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
            >
              Pesan Sekarang <ChevronRight size={20} />
            </Link>
            <a 
              href="#services" 
              className="bg-white text-slate-700 border border-slate-200 px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              Jelajahi Layanan
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-10 pt-8 border-t border-slate-200 flex items-center justify-center md:justify-start gap-8 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-500" />
              <span>Verifikasi Keamanan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-blue-500" />
              <span>Konfirmasi Instant</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              <span>Mitra Terbaik</span>
            </div>
          </div>
        </div>

        {/* Hero Right Side - Animated SVG App Illustration */}
        <div className="flex-1 relative w-full max-w-lg mx-auto md:max-w-none flex justify-center items-center">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-400/30 via-purple-300/30 to-blue-300/20 rounded-full blur-3xl opacity-70 animate-pulse"></div>

          {/* Container Card with Floating Animation */}
          <div className="relative w-full max-w-md p-6 bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl shadow-2xl space-y-6 transform hover:scale-[1.02] transition-transform duration-500">
            
            {/* Animated SVG Graphic */}
            <div className="relative w-full aspect-[4/3] flex items-center justify-center">
              <svg viewBox="0 0 500 400" className="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                  <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#1e293b" floodOpacity="0.12" />
                  </filter>
                </defs>

                {/* Background Device Frame */}
                <rect x="40" y="30" width="420" height="340" rx="24" fill="url(#bgGrad)" filter="url(#shadow)" stroke="#cbd5e1" strokeWidth="2" />
                
                {/* Header Bar */}
                <rect x="40" y="30" width="420" height="50" rx="24" fill="url(#primaryGrad)" />
                <rect x="40" y="60" width="420" height="20" fill="url(#primaryGrad)" />
                <circle cx="70" cy="55" r="6" fill="#ffffff" opacity="0.8" />
                <circle cx="90" cy="55" r="6" fill="#ffffff" opacity="0.8" />
                <circle cx="110" cy="55" r="6" fill="#ffffff" opacity="0.8" />
                <rect x="140" y="45" width="220" height="20" rx="10" fill="#ffffff" opacity="0.25" />

                {/* Calendar Grid Card inside App */}
                <rect x="70" y="105" width="210" height="155" rx="16" fill="#ffffff" filter="url(#shadow)" />
                {/* Calendar Header */}
                <rect x="70" y="105" width="210" height="40" rx="16" fill="#f1f5f9" />
                <text x="90" y="130" fill="#334155" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Jadwal Reservasi</text>
                <circle cx="255" cy="125" r="10" fill="#3b82f6" opacity="0.15" />
                <path d="M251 125l3 3 5-5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                {/* Calendar Days Simulation */}
                <rect x="85" y="160" width="30" height="24" rx="6" fill="#eff6ff" />
                <rect x="125" y="160" width="30" height="24" rx="6" fill="#eff6ff" />
                <rect x="165" y="160" width="30" height="24" rx="6" fill="#eff6ff" />
                <rect x="205" y="160" width="30" height="24" rx="6" fill="url(#primaryGrad)" />
                <text x="213" y="176" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="sans-serif">26</text>

                <rect x="85" y="195" width="30" height="24" rx="6" fill="#eff6ff" />
                <rect x="125" y="195" width="30" height="24" rx="6" fill="#eff6ff" />
                <rect x="165" y="195" width="30" height="24" rx="6" fill="#eff6ff" />
                <rect x="205" y="195" width="30" height="24" rx="6" fill="#eff6ff" />

                <rect x="85" y="230" width="150" height="16" rx="8" fill="#e2e8f0" />

                {/* Time Slot Selection Card inside App */}
                <rect x="295" y="105" width="135" height="155" rx="16" fill="#ffffff" filter="url(#shadow)" />
                <text x="310" y="130" fill="#334155" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Pilih Jam</text>
                
                <rect x="310" y="145" width="105" height="28" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <text x="330" y="163" fill="#64748b" fontSize="11" fontFamily="sans-serif">09:00 AM</text>
                
                <rect x="310" y="180" width="105" height="28" rx="8" fill="url(#accentGrad)" />
                <text x="330" y="198" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="sans-serif">10:30 AM ✓</text>

                <rect x="310" y="215" width="105" height="28" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <text x="330" y="233" fill="#64748b" fontSize="11" fontFamily="sans-serif">02:00 PM</text>

                {/* Status Bar Bottom */}
                <rect x="70" y="280" width="360" height="65" rx="16" fill="#ffffff" filter="url(#shadow)" />
                <circle cx="105" cy="312" r="18" fill="#dcfce7" />
                <path d="M98 312l5 5 9-9" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <text x="135" y="306" fill="#0f172a" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Booking Berhasil Dikonfirmasi!</text>
                <text x="135" y="324" fill="#64748b" fontSize="11" fontFamily="sans-serif">ID: #BK-88219 • Pengingat otomatis aktif</text>
              </svg>
            </div>

            {/* Floating Live Badge 1 */}
            <div className="absolute -top-4 -left-4 bg-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Status Real-time</div>
                <div className="text-[10px] text-slate-500">Terkoneksi Database</div>
              </div>
            </div>

            {/* Floating Live Badge 2 */}
            <div className="absolute -bottom-4 -right-4 bg-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Star size={18} fill="#d97706" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Respon &lt; 1 Menit</div>
                <div className="text-[10px] text-slate-500">Konfirmasi Otomatis</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">{services.length}+</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Layanan Tersedia</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">{categories.length}+</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kategori Pilihan</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">10k+</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Reservasi Sukses</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">4.9/5</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rating Pelanggan</div>
          </div>
        </div>
      </section>

      {/* 3. List Service Section */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
            Daftar Layanan Populer
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Pilih layanan yang sesuai dengan kebutuhan Anda. Semua data diambil secara langsung dari database sistem secara real-time.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Semua Kategori ({services.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  Number(selectedCategory) === Number(cat.id)
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto">
            <Filter size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-700 mb-1">Tidak ada layanan ditemukan</h3>
            <p className="text-xs text-slate-500">Belum ada layanan untuk kategori ini di database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div 
                key={service.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-primary-50 text-primary-700">
                      {service.category?.name || 'Umum'}
                    </span>
                    <span className="text-xl font-extrabold text-green-600">
                      ${service.price}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-2">
                    {service.name}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 mb-6">
                    {service.description || 'Tidak ada deskripsi layanan.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <Clock size={16} className="text-primary-500" />
                    <span>{service.duration} Menit</span>
                  </div>

                  <Link 
                    to={user ? "/customer/bookings" : "/login"}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm inline-flex items-center gap-1"
                  >
                    Pesan Sekarang
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. FAQ Section */}
      <section id="faq" className="py-20 bg-slate-100 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-3">
              <HelpCircle size={14} />
              <span>Paling Sering Ditanyakan</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              Pertanyaan Umum (FAQ)
            </h2>
            <p className="text-slate-600 text-sm">
              Temukan jawaban atas pertanyaan yang sering diajukan mengenai pemesanan layanan di Bookify.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left font-bold text-slate-800 flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp size={20} className="text-primary-600 shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Footer Section */}
      <footer id="contact" className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                B
              </div>
              <span className="text-2xl font-bold text-white">Bookify</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Platform sistem reservasi janji temu dan layanan terbaik yang menghubungkan penyedia layanan profesional dengan pelanggan secara online.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Navigasi Cepat</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#services" className="hover:text-primary-400 transition-colors">Daftar Layanan</a></li>
              <li><a href="#faq" className="hover:text-primary-400 transition-colors">FAQ</a></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Masuk Akun</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Daftar Akun Baru</Link></li>
            </ul>
          </div>

          {/* Roles */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Portal Pengguna</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Portal Pelanggan</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Portal Provider Mitra</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Portal Administrator</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Hubungi Kami</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-primary-500 shrink-0" />
                <span>support@bookify.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-primary-500 shrink-0" />
                <span>+62 (021) 800-BOOK</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin size={16} className="text-primary-500 shrink-0" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Bookify. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Kebijakan Privasi</span>
            <span className="hover:text-slate-400 cursor-pointer">Syarat & Ketentuan</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
