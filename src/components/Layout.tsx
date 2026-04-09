import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Heart, Menu, X, Globe, User, LogOut, ChevronDown,
  LayoutDashboard, Stethoscope, Watch, BookOpen, Activity, Download, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import EmergencyButton from './EmergencyButton';
import SupportChatWidget from './SupportChatWidget';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLangSelector, setShowLangSelector] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, currentLang, setLanguage } = useLanguage();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: t('home'), icon: LayoutDashboard },
    { path: '/assessment', label: t('assessment'), icon: Activity },
    { path: '/telemedicine', label: t('telemedicine'), icon: Stethoscope },
    { path: '/wearables', label: t('devices'), icon: Watch },
    { path: '/education', label: t('education'), icon: BookOpen },
    { path: '/downloads', label: 'Download', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-mamacare-cream font-body">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glassmorphism shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <Heart className="w-10 h-10 text-mamacare-coral" />
              <span className="font-display text-2xl font-bold text-mamacare-coral">Mamacare</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? 'bg-mamacare-coral text-white'
                      : 'text-mamacare-charcoal hover:bg-mamacare-champagne hover:text-mamacare-coral'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Emergency Button */}
              <EmergencyButton />
              
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openMamacareChat'))}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-mamacare-coral text-white text-sm font-medium hover:bg-mamacare-coral-dark transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                24/7 Chat
              </button>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangSelector(!showLangSelector)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-mamacare-champagne transition-colors"
                >
                  <Globe className="w-5 h-5 text-mamacare-coral" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {languages.find(l => l.code === currentLang)?.flag}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showLangSelector && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-mamacare-champagne py-2 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLangSelector(false);
                          toast.success(`Language changed to ${lang.name}`);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-mamacare-champagne transition-colors flex items-center gap-2 ${
                          currentLang === lang.code ? 'bg-mamacare-coral/10 text-mamacare-coral' : 'text-mamacare-charcoal'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-mamacare-champagne transition-colors"
                  >
                    <div className="w-8 h-8 bg-mamacare-coral rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 hidden sm:block" />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-mamacare-champagne py-2 z-50">
                      <Link
                        to="/profile"
                        className="w-full px-4 py-2 text-left text-sm hover:bg-mamacare-champagne transition-colors flex items-center gap-2 text-mamacare-charcoal"
                      >
                        <User className="w-4 h-4" />
                        {t('profile')}
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="w-full px-4 py-2 text-left text-sm hover:bg-mamacare-champagne transition-colors flex items-center gap-2 text-mamacare-charcoal"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {t('admin')}
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-mamacare-champagne transition-colors flex items-center gap-2 text-red-500"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" className="text-mamacare-charcoal hover:text-mamacare-coral">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-mamacare-coral hover:bg-mamacare-coral-dark text-white">
                      {t('register')}
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-mamacare-champagne transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-mamacare-champagne">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    location.pathname === link.path
                      ? 'bg-mamacare-coral text-white'
                      : 'hover:bg-mamacare-champagne text-mamacare-charcoal'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              
              {!isAuthenticated && (
                <div className="pt-4 border-t border-mamacare-champagne space-y-2">
                  <Link to="/login" className="block w-full">
                    <Button variant="outline" className="w-full">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link to="/register" className="block w-full">
                    <Button className="w-full bg-mamacare-coral hover:bg-mamacare-coral-dark text-white">
                      {t('register')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      <SupportChatWidget />

      {/* Footer */}
      <footer className="bg-mamacare-charcoal py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-8 h-8 text-mamacare-coral fill-mamacare-coral" />
                <span className="font-display text-2xl font-bold text-white">Mamacare</span>
              </div>
              <p className="text-white/60 leading-relaxed">{t('footerTagline')}</p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-display text-lg font-semibold text-white mb-4">{t('quickLinks')}</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-white/60 hover:text-mamacare-coral transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="font-display text-lg font-semibold text-white mb-4">{t('resources')}</h4>
              <ul className="space-y-2">
                <li><Link to="/education" className="text-white/60 hover:text-mamacare-coral transition-colors">{t('educationHub')}</Link></li>
                <li><a href="#" className="text-white/60 hover:text-mamacare-coral transition-colors">Blog</a></li>
                <li><a href="#" className="text-white/60 hover:text-mamacare-coral transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-white/60 hover:text-mamacare-coral transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-display text-lg font-semibold text-white mb-4">{t('contact')}</h4>
              <ul className="space-y-2">
                <li className="text-white/60">{t('supportEmail')}</li>
                <li className="text-white/60">{t('supportPhone')}</li>
                <li className="text-white/60">{t('location')}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              © 2025 MamaCare. {t('rights')} {t('researchBy')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-mamacare-coral transition-colors">
                <Globe className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
