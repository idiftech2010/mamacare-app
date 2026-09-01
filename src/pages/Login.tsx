import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, Lock, Phone, Chrome, Eye, EyeOff, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  // We pull 'login' and 'loginWithGoogle' from the context
  const { loginWithGoogle, login } = useAuth();
  
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

    try {
      if (loginMethod === 'email') {
        // This calls the login function in AuthContext which hits your Render backend
        const loggedInUser = await login(formData.email, formData.password);
        toast.success('Welcome back!');
        navigate(['clinician', 'data_entry'].includes(loggedInUser?.role) ? '/clinical' : '/profile');
      } else {
        toast.info('Phone login is currently being updated.');
      }
    } catch (error: any) {
      // Show the specific error message from your backend if available
      toast.error(error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginClick = async () => {
    setIsLoading(true);
    try {
      // This triggers Firebase Login -> Then hits your Render /auth/google endpoint
      const user = await loginWithGoogle();
      if (user) {
        toast.success('Signed in with Google');
        navigate('/profile');
      }
    } catch (error: any) {
      console.error('Login redirect error:', error);
      toast.error(error?.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

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

            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  loginMethod === 'email' ? 'bg-mamacare-coral text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  loginMethod === 'phone' ? 'bg-mamacare-coral text-white' : 'bg-gray-100 text-gray-600'
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
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

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
              onClick={handleGoogleLoginClick}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}