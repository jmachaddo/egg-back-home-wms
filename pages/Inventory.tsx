import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Search, Filter, MoreVertical, Download } from 'lucide-react';

const mockInventory: InventoryItem[] = [
  { id: '1', sku: 'EGG-001', name: 'Premium Ceramic Egg Holder', category: 'Kitchenware', quantity: 150, location: 'A-01-01', status: 'In Stock', lastUpdated: '2023-10-25' },
  { id: '2', sku: 'EGG-002', name: 'Egg Whisk Pro', category: 'Tools', quantity: 24, location: 'B-02-12', status: 'Low Stock', lastUpdated: '2023-10-24' },
  { id: '3', sku: 'EGG-003', name: 'Industrial Egg Timer', category: 'Electronics', quantity: 0, location: 'C-05-01', status: 'Out of Stock', lastUpdated: '2023-10-20' },
  { id: '4', sku: 'EGG-004', name: 'Decorative Easter Eggs (Set)', category: 'Decor', quantity: 500, location: 'A-01-02', status: 'In Stock', lastUpdated: '2023-10-22' },
  { id: '5', sku: 'EGG-005', name: 'Ostrich Egg Stand', category: 'Decor', quantity: 12, location: 'D-01-01', status: 'Low Stock', lastUpdated: '2023-10-26' },
];

export const Inventory: React.FC = () => {
  const [items] = useState<InventoryItem[]>(mockInventory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
           <p className="text-sm text-slate-500">View and manage stock across all locations.</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
             <Download size={16} />
             Export
           </button>
           <button className="px-4 py-2 bg-egg-500 text-white rounded-lg text-sm font-medium hover:bg-egg-600">
             + Add Item
           </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, SKU, or category..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-egg-500/20 focus:border-egg-500 transition-all text-sm"
            />
         </div>
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 w-full sm:w-auto justify-center">
               <Filter size={16} />
               Filters
            </button>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{item.sku}</td>
                  <td className="px-6 py-4 text-slate-600">{item.category}</td>
                  <td className="px-6 py-4 text-slate-800 font-semibold">{item.quantity}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-mono">
                      {item.location}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                      item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{item.lastUpdated}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
