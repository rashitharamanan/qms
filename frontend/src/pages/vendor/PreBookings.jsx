import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, Check, X, User, Phone, Ticket, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayout';

const navItems = [
  { to: "/vendor", icon: "📊", label: "Dashboard" },
  { to: "/vendor/queue", icon: "🎫", label: "Queue" },
  { to: "/vendor/pre-bookings", icon: "📅", label: "Pre-bookings" },
  { to: "/vendor/services", icon: "⚙️", label: "Services" },
  { to: "/vendor/shop", icon: "🏪", label: "My Shop" },
  { to: "/vendor/analytics", icon: "📈", label: "Analytics" },
];

export default function PreBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/vendor/pre-bookings');
      setBookings(data.data);
    } catch (err) {
      toast.error('Failed to fetch pre-bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAction = async (tokenId, action) => {
    try {
      if (action === 'confirm') {
        await api.put('/vendor/pre-bookings/confirm', { tokenId });
        toast.success('Booking confirmed');
      } else {
        await api.put('/vendor/queue/reject', { tokenId });
        toast.success('Booking rejected');
      }
      fetchBookings();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (loading) return <DashboardLayout navItems={navItems}><div className="p-8 text-center">Loading pre-bookings...</div></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Pre-booking Requests</h1>
            <p className="text-slate-500 font-medium mt-1">Manage future queue reservations</p>
          </div>
          <div className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-xs font-black border border-purple-200">
            {bookings.length} Requests
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="glass-card py-20 text-center border-dashed border-2 border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={40} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-700">No Pre-bookings</h2>
            <p className="text-slate-400 mt-1">New booking requests will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="glass-card overflow-hidden hover:border-lavender group transition-all">
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                      <Calendar size={14} />
                      <span className="text-xs font-black">{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                      <Clock size={14} />
                      <span className="text-xs font-black">{booking.scheduledTime}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                        <User size={20} className="text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{booking.customerId?.name || 'Customer'}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone size={12} /> {booking.customerId?.phone || 'No phone'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                      <Ticket size={14} className="text-purple-500" />
                      <div className="text-xs font-bold text-slate-700">
                        {booking.serviceId?.serviceName}
                      </div>
                      <div className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {booking.tokenNumber}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    {booking.status === 'pending' ? (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(booking._id, 'confirm')}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button
                          onClick={() => handleAction(booking._id, 'reject')}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
                        >
                          <X size={16} /> Decline
                        </button>
                      </div>
                    ) : (
                      <div className={`w-full py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 border ${
                        booking.status === 'scheduled' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        booking.status === 'waiting' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        booking.status === 'called' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        booking.status === 'in-service' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {booking.status === 'scheduled' && <><Check size={14} /> Approved</>}
                        {booking.status === 'waiting' && <><Clock size={14} /> Waiting in Queue</>}
                        {booking.status === 'called' && <><AlertCircle size={14} /> Being Called</>}
                        {booking.status === 'in-service' && <><Ticket size={14} /> In Service</>}
                        {booking.status === 'rejected' && <><X size={14} /> Declined</>}
                        {(!['scheduled', 'waiting', 'called', 'in-service', 'rejected'].includes(booking.status)) && booking.status.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
