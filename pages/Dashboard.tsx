import React from 'react';
import { Package, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { DashboardStat } from '../types';

const stats: DashboardStat[] = [
  { label: 'Total Inventory', value: '12,450', change: '+2.5%', trend: 'up', icon: Package },
  { label: 'Low Stock Items', value: '14', change: '-5', trend: 'up', icon: AlertTriangle },
  { label: 'Pending Inbound', value: '8', change: '3 arriving today', trend: 'neutral', icon: Clock },
  { label: 'Daily Outbound', value: '145', change: '+12%', trend: 'up', icon: TrendingUp },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <div className="text-sm text-slate-500">Last updated: Just now</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${
                stat.label === 'Low Stock Items' ? 'bg-red-50 text-red-600' : 'bg-egg-50 text-egg-600'
              }`}>
                <stat.icon size={20} />
              </div>
              {stat.change && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {stat.change}
                </span>
              )}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Movements</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">SKU-100{i} Restocked</p>
                    <p className="text-xs text-slate-500">Zone A • Rack {i}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-500">2h ago</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full py-2 px-4 bg-egg-500 hover:bg-egg-600 text-white rounded-lg text-sm font-medium transition-colors">
              Receive Goods
            </button>
            <button className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors">
              Create Shipment
            </button>
            <button className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors">
              Cycle Count
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
