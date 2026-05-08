import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import MainLayout from "../../layouts/MainLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatTime12 } from "../../utils/helpers";
import { useSocket } from "../../context/SocketContext";
import {
  Clock, ChevronRight, Ticket, ExternalLink, TicketCheck,
  Plus, Sparkles, Users, MapPin, Zap, CheckCircle, XCircle,
  AlertCircle, ArrowRight, Timer, Hash
} from "lucide-react";

const P = {
  plum:  '#4A2766',
  base:  '#7B5C9E',
  mid:   '#9B7CBD',
  light: '#C9ABDF',
  pale:  '#EDE8F4',
};

const statusConfig = {
  scheduled:    { label: 'Scheduled',   icon: Clock,       color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', dot: '#818cf8', emoji: '📅' },
  pending:      { label: 'Pending',     icon: AlertCircle, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B', emoji: '⏳' },
  waiting:      { label: 'In Queue',    icon: Timer,       color: P.plum,    bg: '#F5F0FB', border: P.light,   dot: P.base,   emoji: '🎟️' },
  called:       { label: 'Your Turn!',  icon: Zap,         color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD', dot: '#3B82F6', emoji: '🔔' },
  'in-service': { label: 'Serving',     icon: Sparkles,    color: '#059669', bg: '#ECFDF5', border: '#6EE7B7', dot: '#10B981', emoji: '⚡' },
  completed:    { label: 'Completed',   icon: CheckCircle, color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC', dot: '#22C55E', emoji: '✅' },
  skipped:      { label: 'Skipped',     icon: ArrowRight,  color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444', emoji: '⏩' },
  cancelled:    { label: 'Cancelled',   icon: XCircle,     color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', dot: '#94A3B8', emoji: '🚫' },
  rejected:     { label: 'Rejected',    icon: XCircle,     color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444', emoji: '❌' },
};

export default function MyTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');
  const { socket } = useSocket();

  const fetchTokens = async () => {
    const { data } = await api.get("/queue/my-tokens");
    setTokens(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchTokens(); }, []);

  useEffect(() => {
    if (!socket) return;
    const shopIds = [...new Set(tokens.map(t => t.shopId?._id).filter(Boolean))];
    shopIds.forEach(id => socket.emit("join-shop", id));
    const handler = () => fetchTokens();
    socket.on("token-called", handler);
    socket.on("token-completed", handler);
    socket.on("token-skipped", handler);
    socket.on("queue_updated", handler);
    return () => {
      socket.off("token-called", handler);
      socket.off("token-completed", handler);
      socket.off("token-skipped", handler);
      socket.off("queue_updated", handler);
      shopIds.forEach(id => socket.emit("leave-shop", id));
    };
  }, [socket, tokens.length]);

  const cancelToken = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this token?")) return;
    await api.put("/queue/" + id + "/cancel");
    fetchTokens();
  };

  // ── 3D card tilt ──
  const onCardMove = useCallback((e) => {
    const el = e.currentTarget;
    el.style.transition = 'box-shadow 0.1s ease';
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const cx = r.width / 2, cy = r.height / 2;
    const rx = ((y - cy) / cy) * -6;
    const ry = ((x - cx) / cx) * 6;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
    el.style.boxShadow = `${ry * -1.5}px ${rx * -1.5}px 24px rgba(74,39,102,0.18), 0 16px 48px rgba(74,39,102,0.12)`;
    const shine = el.querySelector('.card-shine');
    if (shine) { shine.style.opacity = '1'; shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.22) 0%, transparent 60%)`; }
  }, []);
  const onCardEnter = useCallback((e) => { e.currentTarget.style.transition = 'none'; }, []);
  const onCardLeave = useCallback((e) => {
    const el = e.currentTarget;
    el.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease';
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    el.style.boxShadow = '0 2px 12px rgba(74,39,102,0.10), 0 4px 20px rgba(74,39,102,0.06)';
    const shine = el.querySelector('.card-shine');
    if (shine) shine.style.opacity = '0';
  }, []);

  const activeTokens = tokens.filter(t => ['waiting', 'called', 'in-service', 'pending', 'scheduled'].includes(t.status));
  const pastTokens = tokens.filter(t => ['completed', 'skipped', 'cancelled', 'rejected'].includes(t.status));
  const displayTokens = tab === 'active' ? activeTokens : pastTokens;

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <style>{`
        .token-card-3d {
          transform-style: preserve-3d;
          will-change: transform;
          transition: transform 0.1s ease, box-shadow 0.3s ease;
        }
        .token-card-3d .card-shine {
          position: absolute; inset: 0; border-radius: inherit;
          pointer-events: none; z-index: 20; opacity: 0;
          transition: opacity 0.3s ease;
        }
        @keyframes ticket-float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .called-shimmer::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: shimmer-slide 2s ease-in-out infinite;
        }
        @keyframes counter-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden bg-slate-50/50">
        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 py-8 space-y-7">

          {/* ══════════════════════════════════════
              HEADER
          ══════════════════════════════════════ */}
          <header className="fade-in">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-sm"
                  style={{ background: 'white', borderColor: P.light, color: P.base }}>
                  <TicketCheck size={13} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Queue Tracker</span>
                </div>
                <h1 className="font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
                  My{' '}
                  <span style={{
                    background: `linear-gradient(135deg, ${P.plum}, ${P.base})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>Tokens</span>
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                  Track and manage your real-time queue positions
                </p>
              </div>
              <Link to="/shops"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white shrink-0
                           hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, ${P.plum}, ${P.base})`,
                  boxShadow: `0 4px 18px rgba(74, 39, 102, 0.35)`,
                }}
              >
                <Plus size={16} /> New Token
              </Link>
            </div>
          </header>

          {/* ══════════════════════════════════════
              STATS BAR
          ══════════════════════════════════════ */}
          {tokens.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 fade-in" style={{ animationDelay: '80ms' }}>
              {[
                { label: 'Active', value: activeTokens.length, icon: Zap, accent: P.plum, bgColor: '#F5F0FB' },
                { label: 'In Queue', value: tokens.filter(t => t.status === 'waiting').length, icon: Users, accent: P.mid, bgColor: '#F5F0FB' },
                { label: 'Called', value: tokens.filter(t => t.status === 'called').length, icon: AlertCircle, accent: '#2563EB', bgColor: '#EFF6FF' },
                { label: 'Done Today', value: pastTokens.length, icon: CheckCircle, accent: '#16A34A', bgColor: '#F0FDF4' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 flex items-center gap-3 border transition-all hover:-translate-y-0.5"
                  style={{ borderColor: '#EDE8F4', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(92,58,138,0.06)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: s.bgColor }}>
                    <s.icon size={18} style={{ color: s.accent }} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-900 leading-tight">{s.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══════════════════════════════════════
              TABS
          ══════════════════════════════════════ */}
          <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white border shadow-sm fade-in"
            style={{ borderColor: '#EDE8F4', animationDelay: '120ms', maxWidth: '340px' }}>
            {[
              { id: 'active', label: 'Active', count: activeTokens.length },
              { id: 'past', label: 'History', count: pastTokens.length },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2"
                style={tab === t.id
                  ? { background: `linear-gradient(135deg, ${P.plum}, ${P.base})`, color: '#fff', boxShadow: `0 4px 14px rgba(74,39,102,0.25)` }
                  : { color: '#94A3B8' }
                }
              >
                {t.label}
                <span className="px-1.5 py-0.5 rounded-lg text-[9px] font-black"
                  style={tab === t.id
                    ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                    : { background: '#F1F5F9', color: '#94A3B8' }
                  }>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════
              TOKEN LIST / EMPTY STATE
          ══════════════════════════════════════ */}
          {displayTokens.length === 0 ? (
            <div className="bg-white rounded-3xl py-16 px-8 text-center card-enter border"
              style={{ borderColor: '#EDE8F4', boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 20px rgba(92,58,138,0.08)' }}>
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 relative"
                style={{ background: P.pale, border: `2px solid ${P.light}`, animation: 'ticket-float 4s ease-in-out infinite' }}>
                <Ticket size={40} style={{ color: P.base }} />
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                  style={{ background: `linear-gradient(135deg, ${P.plum}, ${P.base})`, color: '#fff' }}>
                  {tab === 'active' ? '0' : '0'}
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">
                {tab === 'active' ? 'No Active Tokens' : 'No Past Tokens'}
              </h2>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto font-medium text-sm">
                {tab === 'active'
                  ? "You haven't joined any queues yet. Browse nearby shops to get started!"
                  : "Your completed sessions will appear here."
                }
              </p>
              {tab === 'active' && (
                <Link to="/shops"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{ border: `2px solid ${P.light}`, color: P.plum, background: 'white' }}
                >
                  <Sparkles size={14} /> Browse Shops
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayTokens.map((token, i) => {
                const status = statusConfig[token.status] || statusConfig.waiting;
                const isTurn = token.status === 'called';
                const isServing = token.status === 'in-service';
                const isActive = ['waiting', 'called', 'in-service', 'pending'].includes(token.status);
                const StatusIcon = status.icon;

                return (
                  <div key={token._id}
                    className={`card-enter stagger-${(i % 6) + 1} group relative`}
                  >
                    {/* Called glow ring */}
                    {isTurn && (
                      <div className="absolute -inset-[3px] rounded-[1.8rem] blur-sm"
                        style={{
                          background: `linear-gradient(135deg, ${status.dot}55, ${P.base}55)`,
                          animation: 'counter-pulse 2s ease-in-out infinite',
                        }} />
                    )}

                    <div
                      className={`token-card-3d relative rounded-3xl bg-white overflow-hidden transition-all duration-300 ${isTurn ? 'called-shimmer' : ''}`}
                      style={{
                        border: `1px solid ${isTurn ? status.border : '#EDE8F4'}`,
                        boxShadow: isTurn
                          ? `0 4px 24px rgba(37,99,235,0.15), 0 12px 44px rgba(37,99,235,0.10)`
                          : '0 2px 12px rgba(74,39,102,0.10), 0 4px 20px rgba(74,39,102,0.06)',
                      }}
                      onMouseMove={isActive ? onCardMove : undefined}
                      onMouseEnter={isActive ? onCardEnter : undefined}
                      onMouseLeave={isActive ? onCardLeave : undefined}
                    >
                      <div className="card-shine" />

                      <div className="flex flex-col sm:flex-row items-stretch relative z-10">

                        {/* ── Token Number Panel ── */}
                        <div
                          className="p-5 sm:p-6 sm:w-44 flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden shrink-0"
                          style={{
                            background: isTurn
                              ? `linear-gradient(135deg, #2563EB, ${P.base})`
                              : isServing
                                ? `linear-gradient(135deg, #059669, #10B981)`
                                : isActive
                                  ? `linear-gradient(135deg, ${P.plum}, ${P.base})`
                                  : `linear-gradient(135deg, #64748B, #94A3B8)`,
                          }}
                        >
                          {/* Decorative circles */}
                          <div className="absolute top-[-20px] right-[-20px] w-20 h-20 rounded-full bg-white/10" />
                          <div className="absolute bottom-[-12px] left-[-12px] w-14 h-14 rounded-full bg-white/10" />

                          <span className="relative text-[9px] font-black uppercase tracking-[0.25em] text-white/60">
                            Token
                          </span>
                          <span className="relative text-4xl sm:text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                            {token.tokenNumber}
                          </span>

                          {/* Status pill */}
                          <div className="relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                            <span className={`w-1.5 h-1.5 rounded-full bg-white ${isTurn ? 'animate-ping' : ''}`} />
                            {status.label}
                          </div>
                        </div>

                        {/* ── Details Panel ── */}
                        <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-3 min-w-0">
                            {/* Shop name & service */}
                            <div>
                              <h3 className="text-lg font-black text-slate-900 truncate transition-colors duration-200"
                                style={{ '--tw-text-opacity': 1 }}>
                                {token.shopId?.shopName}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-slate-500 font-semibold text-sm flex-wrap">
                                <span className="flex items-center gap-1.5">
                                  <Ticket size={13} style={{ color: P.mid }} />
                                  {token.serviceId?.serviceName}
                                </span>
                                {token.isPreBooked ? (
                                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                                    <Clock size={13} />
                                    {new Date(token.scheduledDate).toLocaleDateString()} at {token.scheduledTime}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5">
                                    <Clock size={13} style={{ color: P.mid }} />
                                    {formatTime12(token.createdAt)}
                                  </span>
                                )}
                                {token.shopId?.location?.city && (
                                  <span className="flex items-center gap-1.5">
                                    <MapPin size={13} style={{ color: P.mid }} />
                                    {token.shopId.location.city}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Wait Stats for active */}
                            {['waiting', 'pending'].includes(token.status) && (
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.base }}>Wait</span>
                                  <span className="text-lg font-black text-slate-900">
                                    ~{token.estimatedWaitTime} <span className="text-xs text-slate-400">min</span>
                                  </span>
                                </div>
                                <div className="w-px h-8" style={{ background: '#EDE8F4' }} />
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.base }}>Position</span>
                                  <span className="text-lg font-black text-slate-900">
                                    #{token.position} <span className="text-xs text-slate-400">in line</span>
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Called alert */}
                            {isTurn && (
                              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl w-fit"
                                style={{ background: status.bg, border: `1px solid ${status.border}` }}>
                                <span className="w-2 h-2 rounded-full animate-ping" style={{ background: status.dot }} />
                                <span className="text-xs font-black uppercase tracking-wider" style={{ color: status.color }}>
                                  It's your turn — proceed to counter!
                                </span>
                              </div>
                            )}

                            {/* In-service alert */}
                            {isServing && (
                              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl w-fit"
                                style={{ background: status.bg, border: `1px solid ${status.border}` }}>
                                <Zap size={13} style={{ color: status.color }} />
                                <span className="text-xs font-black uppercase tracking-wider" style={{ color: status.color }}>
                                  Currently being served
                                </span>
                              </div>
                            )}
                          </div>

                          {/* ── Action buttons ── */}
                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0">
                            <Link
                              to={`/token/${token._id}`}
                              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-bold text-xs text-white hover:-translate-y-0.5 active:scale-95 transition-all"
                              style={{
                                background: isTurn
                                  ? 'linear-gradient(135deg, #2563EB, #3B82F6)'
                                  : `linear-gradient(135deg, ${P.plum}, ${P.base})`,
                                boxShadow: isTurn
                                  ? '0 4px 14px rgba(37,99,235,0.35)'
                                  : `0 4px 14px rgba(74,39,102,0.30)`,
                              }}
                            >
                              <ExternalLink size={13} />
                              {isTurn ? 'Check In' : 'Track Live'}
                            </Link>
                            {["waiting", "pending"].includes(token.status) && (
                              <button
                                onClick={() => cancelToken(token._id)}
                                className="text-xs font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors px-2 py-1"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}