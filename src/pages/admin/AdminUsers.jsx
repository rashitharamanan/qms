import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, Search, ShieldOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const roleTabs = ['all', 'customer', 'vendor'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');

  const fetchUsers = (r = '') => {
    setLoading(true);
    api.get(`/admin/users${r && r !== 'all' ? `?role=${r}` : ''}`)
      .then(d => setUsers(d.data.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(role); }, [role]);

  const toggleUser = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`);
      toast.success(data.user.isActive ? 'User activated' : 'User deactivated');
      fetchUsers(role);
    } catch (err) {}
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">Manage all platform users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10" />
        </div>
        <div className="flex gap-2">
          {roleTabs.map(tab => (
            <button key={tab} onClick={() => setRole(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize border transition-all ${
                role === tab ? 'bg-lavender-400 text-white border-lavender-400' : 'bg-white text-gray-600 border-gray-200'
              }`}>{tab}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400 font-medium">No users found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(user => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-lavender-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-lavender-700 font-bold text-sm">{user.name[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-400 sm:hidden">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`badge capitalize ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'vendor' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'admin' && (
                      <button onClick={() => toggleUser(user._id)}
                        className={`p-2 rounded-xl transition-all ${
                          user.isActive ? 'hover:bg-red-50 text-gray-400 hover:text-red-500' : 'hover:bg-green-50 text-gray-400 hover:text-green-500'
                        }`}>
                        {user.isActive ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
