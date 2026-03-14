import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, Phone, User, Chrome, Eye, EyeOff, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (!formData.agreeTerms) {
      alert('Please agree to the terms');
      return;
    }

    setIsLoading(true);
    const success = await register(formData.email, formData.password, formData.name, formData.phone);
    setIsLoading(false);
    
    if (success) {
      navigate('/');
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    const success = await loginWithGoogle();
    setIsLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen py-24 bg-gradient-to-br from-mamacare-champagne via-white to-mamacare-champagne">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl border-none">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold text-mamacare-charcoal mb-2">
                {t('createAccount')}
              </h1>
              <p className="text-gray-600">Join MamaCare for personalized maternal health support</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

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
                <Label>{t('phone')} (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
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

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-1 rounded border-gray-300"
                />
                <span className="text-gray-600">{t('agreeTerms')}</span>
              </label>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-mamacare-coral hover:bg-mamacare-coral-dark text-white py-6"
              >
                {isLoading ? 'Creating account...' : t('createAccount')}
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
              onClick={handleGoogleRegister}
              disabled={isLoading}
              className="w-full py-6"
            >
              <Chrome className="w-5 h-5 mr-2" />
              Sign up with Google
            </Button>

            <p className="text-center mt-6 text-sm text-gray-600">
              {t('haveAccount')}{' '}
              <Link to="/login" className="text-mamacare-coral hover:underline font-medium">
                {t('login')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
