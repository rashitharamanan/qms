import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;
    const handleNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };
    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, [socket]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const removed = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (removed && !removed.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'token-called': return { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.30)', text: '#8B5CF6' };
      case 'token-completed': return { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.30)', text: '#10B981' };
      case 'token-skipped': return { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.30)', text: '#F59E0B' };
      case 'token-rejected': return { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.30)', text: '#EF4444' };
      default: return { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.30)', text: '#64748B' };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          const hadUnread = unreadCount > 0;
          setOpen(!open);
          if (!open) {
            fetchNotifications().then(() => {
              if (hadUnread) {
                markAllAsRead();
              }
            });
          }
        }}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all"
        style={{ color: 'rgba(200,160,255,0.70)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200,160,255,0.70)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-black text-white px-1"
            style={{ background: 'linear-gradient(135deg, #EF4444, #F97316)', boxShadow: '0 0 8px rgba(239,68,68,0.60)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-[360px] max-h-[480px] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          style={{
            background: 'rgba(30,10,55,0.97)',
            border: '1px solid rgba(200,160,255,0.18)',
            backdropFilter: 'blur(24px)',
            animation: 'nav-slide-in 0.18s ease',
            boxShadow: '0 20px 60px rgba(20,5,40,0.60)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg text-purple-300/60 hover:text-white hover:bg-white/10 transition-all"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-purple-300/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: '400px' }}>
            {loading && notifications.length === 0 ? (
              <div className="py-12 text-center text-purple-300/50 text-sm font-medium">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-3xl mb-2 opacity-40">🔔</div>
                <p className="text-purple-300/50 text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const colors = getTypeColor(n.type);
                return (
                  <div
                    key={n._id}
                    className={`group flex items-start gap-3 px-4 py-3 border-b border-white/5 transition-all hover:bg-white/5 ${!n.isRead ? 'bg-purple-500/5' : ''}`}
                  >
                    {/* Type indicator */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-sm"
                      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                    >
                      {n.type === 'token-called' && '🔔'}
                      {n.type === 'token-completed' && '✅'}
                      {n.type === 'token-skipped' && '⏭️'}
                      {n.type === 'token-rejected' && '❌'}
                      {!['token-called', 'token-completed', 'token-skipped', 'token-rejected'].includes(n.type) && '📢'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white truncate">{n.title}</p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" style={{ boxShadow: '0 0 6px rgba(168,85,247,0.60)' }} />
                        )}
                      </div>
                      <p className="text-[11px] text-purple-200/50 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-purple-300/30 mt-1 font-medium">{getTimeAgo(n.createdAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n._id)}
                          className="p-1 rounded text-purple-300/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          title="Mark as read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n._id)}
                        className="p-1 rounded text-purple-300/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
