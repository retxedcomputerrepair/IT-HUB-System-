import React from 'react';
import { getAppData } from '../services/storageService';
import { Users, Shield } from 'lucide-react';

const UserManagement: React.FC = () => {
  const users = getAppData().users;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">User Management</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-4 border-b border-slate-100 flex justify-between">
            <h3 className="font-bold text-slate-800">System Users</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Add User</button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {users.map(u => (
              <div key={u.id} className="flex items-start p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <div className={`p-3 rounded-full mr-4 ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                  {u.role === 'ADMIN' ? <Shield size={24} /> : <Users size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{u.name}</h4>
                  <p className="text-sm text-slate-500">@{u.username}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-600">
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default UserManagement;