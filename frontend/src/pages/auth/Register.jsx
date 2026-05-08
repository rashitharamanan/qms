import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';
import { Mail, KeyRound, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer", phone: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setPhoneError("");
    setEmailError("");
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setEmailError("Please enter a valid email address.");
      setLoading(false); return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) {
      setPhoneError("Phone number must be exactly 10 digits.");
      setLoading(false); return;
    }

    try {
      const res = await register(form);
      if (res.requireOtp) {
        toast.success(res.message || "OTP Sent to your email");
        setStep(2);
      } else if (res.token) {
        toast.success("Registration successful!");
        if (res.user.role === "vendor") navigate("/vendor");
        else navigate("/dashboard");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Registration failed";
      if (errMsg.includes("phone number is already registered")) setPhoneError(errMsg);
      else if (errMsg.includes("Email already registered")) setEmailError(errMsg);
      else setError(errMsg);
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Please enter the 6 digit OTP");
    setLoading(true);
    try {
      const user = await verifyEmail(form.email, otp);
      toast.success("Email verified successfully!");
      if (user.role === "vendor") navigate("/vendor");
      else navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lavender-pale flex items-start justify-center pt-8 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="inline-flex w-12 h-12 bg-lavender rounded-2xl items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">Q</div>
          <div className="text-left">
            <h1 className="font-display text-3xl font-bold text-gray-900 leading-tight">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {step === 1 ? "Join QueueMS today" : `OTP sent to ${form.email}`}
            </p>
          </div>
        </div>

        <div className="card shadow-xl border-0">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4 text-center">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
                <input type="text" required className="input-field" placeholder="John Doe"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
                <input type="email" required className={`input-field ${emailError ? 'border-red-500 ring-1 ring-red-500' : ''}`} placeholder="you@example.com"
                  value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setEmailError(""); }} />
                {emailError && <p className="text-red-500 text-xs mt-1.5">{emailError}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone Number</label>
                <input type="tel" required className={`input-field ${phoneError ? 'border-red-500 ring-1 ring-red-500' : ''}`} placeholder="10-digit number"
                  value={form.phone} onChange={e => { setForm({ ...form, phone: e.target.value }); setPhoneError(""); }} />
                {phoneError && <p className="text-red-500 text-xs mt-1.5">{phoneError}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {["customer", "vendor"].map(role => (
                    <button key={role} type="button"
                      className={`py-3 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${form.role === role
                          ? "border-lavender bg-lavender text-white shadow-md"
                          : "border-gray-200 text-gray-500 hover:border-lavender/40 hover:bg-gray-50"
                        }`}
                      onClick={() => setForm({ ...form, role })}>
                      {role === "customer" ? "👤 Customer" : "🏪 Vendor"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
                <input type="password" required minLength={6} className="input-field" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? "Sending OTP..." : "Create Account"}
              </button>

              <div className="pt-4 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">Already registered? <Link to="/login" className="text-lavender-dark font-medium hover:underline">Sign in</Link></p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 bg-lavender-pale">
                  <ShieldCheck size={24} className="text-lavender-dark" />
                </div>
                <p className="text-sm text-gray-500">Check your inbox for the 6-digit code</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5 text-center">Enter 6-Digit OTP</label>
                <div className="relative mt-1">
                  <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="input-field pl-10 text-center text-xl tracking-[0.4em] font-bold"
                    placeholder="------"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? "Verifying..." : "Verify Identity"}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-gray-400 hover:text-lavender-dark font-medium transition-colors">
                ← Change Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}