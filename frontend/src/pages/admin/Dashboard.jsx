import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Box, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
// import api from '../../services/api'; // Nanti untuk fetch data asli

// Mock data untuk UI awal
const bookingData = [
  { name: 'Senin', bookings: 12, revenue: 1500 },
  { name: 'Selasa', bookings: 19, revenue: 2300 },
  { name: 'Rabu', bookings: 15, revenue: 1800 },
  { name: 'Kamis', bookings: 22, revenue: 2800 },
  { name: 'Jumat', bookings: 28, revenue: 3500 },
  { name: 'Sabtu', bookings: 35, revenue: 4200 },
  { name: 'Minggu', bookings: 30, revenue: 3800 },
];

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={trend > 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
      <span className="text-slate-500 ml-2">vs last week</span>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Pantau metrik utama dari Booking App Anda.</p>
        </div>
        <button className="bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 rounded-lg shadow-sm hover:bg-slate-50">
          Last 7 Days
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value="1,248" 
          icon={Users} 
          color="bg-blue-100 text-blue-600" 
          trend={12.5} 
        />
        <StatCard 
          title="Total Bookings" 
          value="3,842" 
          icon={Activity} 
          color="bg-indigo-100 text-indigo-600" 
          trend={8.2} 
        />
        <StatCard 
          title="Total Revenue" 
          value="$45,230" 
          icon={CreditCard} 
          color="bg-emerald-100 text-emerald-600" 
          trend={15.3} 
        />
        <StatCard 
          title="Active Services" 
          value="64" 
          icon={Box} 
          color="bg-amber-100 text-amber-600" 
          trend={-2.4} 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Overview</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Bookings Trend</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="bookings" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
