import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  Mail, Lock, Phone, Chrome, Eye, EyeOff, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithPhone } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let success;
    if (loginMethod === 'email') {
      success = await login(formData.email, formData.password);
    } else {
      success = await loginWithPhone(formData.phone);
    }

    setIsLoading(false);
    if (success) {
      navigate('/');
    }
  };

  const handleGoogleLoginClick = useGoogleLogin({
    onSuccess: async (credentialResponse: any) => {
      setIsLoading(true);
      try {
        const success = await loginWithGoogle(credentialResponse);
        if (success) {
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      alert('Google login failed. Please try again.');
    },
  });

  return (
    <div className="min-h-screen py-24 bg-gradient-to-br from-mamacare-champagne via-white to-mamacare-champagne">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border-none">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold text-mamacare-charcoal mb-2">
                {t('welcomeBack')}
              </h1>
              <p className="text-gray-600">{t('signInToContinue')}</p>
            </div>

            {/* Login Method Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  loginMethod === 'email'
                    ? 'bg-mamacare-coral text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  loginMethod === 'phone'
                    ? 'bg-mamacare-coral text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Phone
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {loginMethod === 'email' ? (
                <>
                  <div className="space-y-2">
                    <Label>{t('email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label>{t('phone')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link to="#" className="text-sm text-mamacare-coral hover:underline">
                  {t('forgotPassword')}
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-mamacare-coral hover:bg-mamacare-coral-dark text-white py-6"
              >
                {isLoading ? 'Signing in...' : t('login')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('orContinueWith')}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleGoogleLoginClick()}
              disabled={isLoading}
              className="w-full py-6"
            >
              <Chrome className="w-5 h-5 mr-2" />
              {t('signInWithGoogle')}
            </Button>

            <p className="text-center mt-6 text-sm text-gray-600">
              {t('noAccount')}{' '}
              <Link to="/register" className="text-mamacare-coral hover:underline font-medium">
                {t('createAccount')}
              </Link>
            </p>

            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Demo Credentials:</strong><br />
                Admin: admin@mamacare.app / admin123<br />
                User: test@example.com / any password
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
