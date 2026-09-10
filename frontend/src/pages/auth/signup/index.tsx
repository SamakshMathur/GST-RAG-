import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { registerApi, sendOtpApi, verifyOtpApi } from '../../../services/auth';
import { ROUTES } from '../../../constants/routes';
import { ChevronDown } from 'lucide-react';

const PROFESSIONS = [
  'Advocate / Lawyer', 'Chartered Accountant (CA)', 'Company Secretary (CS)',
  'Tax Consultant', 'Business Owner', 'Finance Professional',
  'Government Official', 'Student', 'Other',
];

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const SelectField = ({
  id, value, onChange, disabled, placeholder, children,
}: {
  id: string; value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  disabled?: boolean; placeholder: string; children: React.ReactNode;
}) => (
  <div className="relative">
    <select id={id} value={value} onChange={onChange} required disabled={disabled}
      className="select-auth">
      <option value="" disabled className="bg-[#0a0a0a] text-leta-gray-500">{placeholder}</option>
      {children}
    </select>
    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-leta-gray-900/30 pointer-events-none" />
  </div>
);

interface FormState { full_name: string; phone: string; profession: string; gender: string; }
type Step = 'form' | 'otp';

const SignupPage: React.FC = () => {
  const [step, setStep]       = useState<Step>('form');
  const [form, setForm]       = useState<FormState>({ full_name: '', phone: '', profession: '', gender: '' });
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  useEffect(() => {
    if (step === 'otp') inputRefs.current[0]?.focus();
  }, [step]);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let val = e.target.value;
      if (field === 'phone') {
        val = val.replace(/\D/g, '');
      }
      setForm(prev => ({ ...prev, [field]: val }));
    };

  const handleRegisterAndSendOtp = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (form.phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await registerApi(form);
      const data = await sendOtpApi(form.phone.trim(), 'phone');
      if (data?.otp_preview) {
        const session = await verifyOtpApi(form.phone.trim(), data.otp_preview);
        login(session, false);
        navigate(ROUTES.DASHBOARD, { replace: true });
      } else {
        setStep('otp');
        setOtp(['', '', '', '', '', '']);
        setCountdown(data?.cooldown_seconds || 60);
      }
    } catch (err: any) {
      const data = err.response?.data;
      const detail = data?.detail || data?.message;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail[0]?.msg ?? JSON.stringify(detail));
      } else if (err.response?.status) {
        setError(`Server error (${err.response.status}): ${typeof data === 'string' ? data : 'Registration request failed.'}`);
      } else if (err.request) {
        setError(`Cannot reach server — check your connection. (${err.message})`);
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
      console.error('[Signup] Registration/OTP error:', err.response?.status, err.response?.data, err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await sendOtpApi(form.phone.trim(), 'phone');
      setOtp(['', '', '', '', '', '']);
      setCountdown(data?.cooldown_seconds || 60);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError('Please enter the full 6-digit OTP.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const session = await verifyOtpApi(form.phone.trim(), otpString);
      login(session, false);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (err.response) {
        setError(`Server error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        setError(`Cannot reach server — check connection. (${err.message})`);
      } else {
        setError(err.message || 'Invalid OTP. Please try again.');
      }
      console.error('[Signup] Verify OTP error:', err.response?.status, err.response?.data, err.message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = ['', '', '', '', '', ''];
    digits.split('').forEach((d, idx) => { next[idx] = d; });
    setOtp(next);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const isFormValid =
    form.full_name.trim().length > 0 &&
    form.phone.length === 10 &&
    Boolean(form.profession) &&
    Boolean(form.gender);

  return (
    <div className="auth-page py-0">
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      <div className="relative z-20 w-full max-w-md">
        <div className="auth-card">

          <div className="mb-8 text-center">
            <h1 className="font-display font-bold text-3xl text-leta-gray-900 mb-2 uppercase tracking-tight">
              LETA<span className="text-leta-primary">TEC AI</span>
            </h1>
            <p className="text-xs font-mono text-leta-gray-500 uppercase tracking-widest">
              {step === 'form' ? 'Account Setup' : 'Verify Identity'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-leta bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {/* ── Step 1: Registration form ── */}
          {step === 'form' && (
            <form onSubmit={handleRegisterAndSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="full_name" className="label-auth">Full Name</label>
                <input
                  id="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={set('full_name')}
                  required
                  disabled={loading}
                  className="input-auth"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="label-auth">Mobile Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  required
                  disabled={loading}
                  className={`input-auth ${
                    form.phone.length > 0 && form.phone.length !== 10
                      ? '!text-red-400 !border-red-500/50 focus:!border-red-500 focus:!ring-1 focus:!ring-red-500/30'
                      : ''
                  }`}
                  aria-invalid={form.phone.length > 0 ? form.phone.length !== 10 : undefined}
                  placeholder="10-digit mobile number"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="profession" className="label-auth">Profession</label>
                <SelectField
                  id="profession"
                  value={form.profession}
                  onChange={set('profession')}
                  disabled={loading}
                  placeholder="Select your profession"
                >
                  {PROFESSIONS.map(p => (
                    <option key={p} value={p} className="bg-[#0a0a0a] text-leta-gray-900">{p}</option>
                  ))}
                </SelectField>
              </div>

              <div className="space-y-2">
                <label htmlFor="gender" className="label-auth">Gender</label>
                <SelectField
                  id="gender"
                  value={form.gender}
                  onChange={set('gender')}
                  disabled={loading}
                  placeholder="Select gender"
                >
                  {GENDERS.map(g => (
                    <option key={g} value={g} className="bg-[#0a0a0a] text-leta-gray-900">{g}</option>
                  ))}
                </SelectField>
              </div>

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="btn-auth-primary mt-2"
              >
                {loading ? 'Sending OTP...' : 'Setup Account'}
              </button>

              <div className="text-center pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-leta-gray-900/30">
                  Already have an account?{' '}
                  <Link to={ROUTES.LOGIN} className="text-leta-primary hover:text-leta-primary/80 transition-colors">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* ── Step 2: OTP verification ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerify} className="space-y-6">
              <p className="text-center text-xs text-leta-gray-900/50">
                OTP sent to <span className="text-leta-primary font-bold">+91 ••••••{form.phone.slice(-4)}</span>
              </p>

              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    disabled={loading}
                    className="w-11 h-14 text-center text-xl font-bold text-leta-gray-900 bg-leta-gray-50 border border-leta-gray-200 rounded-leta focus:outline-none focus:border-leta-primary/60 focus:ring-1 focus:ring-leta-primary/30 transition-colors disabled:opacity-50 caret-transparent"
                  />
                ))}
              </div>

              <button
                id="verify-signup-btn"
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="btn-auth-primary"
              >
                {loading ? 'Verifying...' : 'Verify & Complete Setup'}
              </button>

              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setError(null);
                    setOtp(['', '', '', '', '', '']);
                  }}
                  className="btn-auth-secondary"
                >
                  ← Change number
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                  className="text-leta-primary disabled:text-leta-gray-900/30 transition-colors disabled:cursor-not-allowed text-[10px] font-bold uppercase tracking-wider"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

        </div>

        <p className="mt-8 text-center text-[10px] font-mono text-leta-gray-900/20 uppercase tracking-[0.1em]">
          &copy; 2026 LETA TEC AI / Sovereign Compliance Systems
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
