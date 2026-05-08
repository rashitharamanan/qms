import { useState } from 'react';
import api from '../../services/api';
import MainLayout from '../../layouts/MainLayout';
import { Mail, MessageSquare, Send, CheckCircle, Smartphone, MapPin, Sparkles } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/feedback', form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[90vh] bg-gradient-to-br from-[#4A2766] via-[#613687] to-[#7B5C9E] relative flex items-center justify-center py-12 px-4 sm:px-6 z-0">
        
        {/* Subtle glowing elements in the dark background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#9B7CBD]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.25)] flex flex-col lg:flex-row overflow-hidden relative z-10 fade-in animate-slide-up">
          
          {/* Left Column: Info & Details */}
          <div className="lg:w-2/5 p-8 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between relative overflow-hidden bg-[#F8F6FA]">
            {/* Soft decorative blob */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#7B5C9E]/10 rounded-full blur-[40px] pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#9B7CBD]/20 shadow-sm text-[#7B5C9E] text-[10px] font-black tracking-[0.2em] uppercase">
                 <Sparkles size={14} className="text-[#4A2766]" />
                 <span>Get In Touch</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-[#4A2766] tracking-tight leading-[1.2]">
                Let's start a conversation
              </h1>
              <p className="text-slate-500 font-medium text-[15px] leading-relaxed">
                Have questions about QueueMS or need assistance? We're here to help you revolutionize your queue management.
              </p>
            </div>

            <div className="space-y-8 mt-12 relative z-10">
              {[
                { icon: Mail, title: "Email Us", details: "support@queuems.com", link: "mailto:support@queuems.com" },
                { icon: Smartphone, title: "Call Us", details: "+1 (555) 123-4567", link: "tel:+15551234567" },
                { icon: MapPin, title: "Visit Us", details: "123 Queue Avenue, NY", link: "#" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 group-hover:bg-[#4A2766] group-hover:border-[#4A2766] rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:shadow-md">
                    <item.icon className="text-[#7B5C9E] group-hover:text-white transition-colors duration-300" size={20} />
                  </div>
                  <div>
                    <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{item.title}</h3>
                    {item.link !== '#' ? (
                      <a href={item.link} className="text-[#4A2766] font-bold text-base hover:text-[#7B5C9E] transition-colors">{item.details}</a>
                    ) : (
                      <p className="text-[#4A2766] font-bold text-base">{item.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:w-3/5 p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-white relative">
            {success ? (
              <div className="text-center py-16 space-y-6 px-4 relative z-10 zoom-in">
                <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_15px_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="text-white" size={48} />
                </div>
                <h3 className="text-3xl font-black text-[#4A2766] tracking-tight">Message Sent!</h3>
                <p className="text-slate-500 font-medium text-base max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. Our amazing team will get back to you within 24 hours.
                </p>
                <button 
                  onClick={() => setSuccess(false)} 
                  className="mt-8 px-6 py-3.5 rounded-xl text-sm font-bold bg-[#F8F6FA] text-[#4A2766] border border-slate-100 hover:bg-[#9B7CBD]/10 hover:border-[#9B7CBD]/20 transition-all active:scale-95"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10 w-full">
                <div className="mb-2">
                  <h2 className="text-2xl font-black text-[#4A2766] mb-1.5">Send us a message</h2>
                  <p className="text-sm font-medium text-slate-500">Fill out the form below and we'll reply to you shortly.</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-3 animate-fade-in">
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2 group">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-[#7B5C9E] transition-colors">Your Name</label>
                    <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-[#F8F6FA] border border-transparent rounded-xl text-sm font-semibold text-[#4A2766] placeholder-slate-300 focus:outline-none focus:bg-white focus:border-[#9B7CBD] focus:ring-[3px] focus:ring-[#9B7CBD]/15 transition-all"
                      placeholder="John Doe" />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-[#7B5C9E] transition-colors">Email Address</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3.5 bg-[#F8F6FA] border border-transparent rounded-xl text-sm font-semibold text-[#4A2766] placeholder-slate-300 focus:outline-none focus:bg-white focus:border-[#9B7CBD] focus:ring-[3px] focus:ring-[#9B7CBD]/15 transition-all"
                      placeholder="john@example.com" />
                  </div>
                </div>
                
                <div className="space-y-2 group">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-[#7B5C9E] transition-colors">Subject</label>
                  <input required type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3.5 bg-[#F8F6FA] border border-transparent rounded-xl text-sm font-semibold text-[#4A2766] placeholder-slate-300 focus:outline-none focus:bg-white focus:border-[#9B7CBD] focus:ring-[3px] focus:ring-[#9B7CBD]/15 transition-all"
                    placeholder="How can we help?" />
                </div>
                
                <div className="space-y-2 group">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 group-focus-within:text-[#7B5C9E] transition-colors">Your Message</label>
                  <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} autoFocus={false} rows={3}
                    className="w-full px-4 py-3.5 bg-[#F8F6FA] border border-transparent rounded-xl text-sm font-semibold text-[#4A2766] placeholder-slate-300 focus:outline-none focus:bg-white focus:border-[#9B7CBD] focus:ring-[3px] focus:ring-[#9B7CBD]/15 transition-all resize-none min-h-[120px]"
                    placeholder="Tell us more about your inquiry..." />
                </div>
                
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-white font-bold text-base transition-all disabled:opacity-70 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(74,39,102,0.25)] active:scale-95 group relative overflow-hidden mt-4"
                  style={{ background: 'linear-gradient(135deg, #4A2766 0%, #7B5C9E 100%)' }}>
                  {/* Hover glare effect */}
                  <div className="absolute top-0 -left-[100%] w-[120%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-700 ease-in-out" />
                  
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
