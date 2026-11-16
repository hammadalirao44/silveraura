import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useShop } from '../context/ShopContext';

export const AdminLoginPage: React.FC = () => {
  const { login, isSupabaseReady, supabaseError } = useAdmin();
  const { navigateTo } = useShop();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to sign in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between text-[#1C1917] selection:bg-[#E5D5C5]">
      {/* Top Header */}
      <div className="py-6 px-6 sm:px-12 flex items-center justify-between border-b border-[#E8E0D5]">
        <button
          onClick={() => navigateTo('home')}
          className="text-left group cursor-pointer"
        >
          <span className="font-serif-luxury text-2xl font-medium tracking-[0.14em] text-[#1C1917] uppercase group-hover:text-[#44403C] transition-colors">
            Silver Aura
          </span>
          <span className="block text-[10px] tracking-widest uppercase text-[#78716C] -mt-0.5">
            Management Portal
          </span>
        </button>

        <button
          onClick={() => navigateTo('home')}
          className="text-xs uppercase tracking-wider text-[#57534E] hover:text-[#1C1917] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Return to Storefront</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Login Form Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white border border-[#E8E0D5] p-8 sm:p-10 shadow-sm rounded-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#F4EFEB] border border-[#E8E0D5] text-[#1C1917] flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#78716C] block">
              Atelier Backoffice
            </span>
            <h1 className="font-serif-luxury text-3xl text-[#1C1917] font-medium">
              Admin Sign In
            </h1>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Sign in with your authorized Supabase administrator account to access Silver Aura operations.
            </p>
          </div>

          {!isSupabaseReady && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Supabase Configuration Required</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {supabaseError ||
                    'Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment before signing in.'}
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1"
              >
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  disabled={!isSupabaseReady || loading}
                  placeholder="curator@silveraura.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D6CEC5] pl-9 pr-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917] transition-colors disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[#44403C] uppercase tracking-wider mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  disabled={!isSupabaseReady || loading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#D6CEC5] pl-9 pr-10 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#1C1917] transition-colors disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isSupabaseReady || loading}
              className="w-full py-3.5 bg-[#1C1917] hover:bg-[#292524] text-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-[#78716C]">
            Protected studio console. Access is verified via Supabase Auth and active administrator roles.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-xs text-[#78716C] border-t border-[#E8E0D5]">
        © {new Date().getFullYear()} Silver Aura Fine Jewellery Atelier.
      </div>
    </div>
  );
};
