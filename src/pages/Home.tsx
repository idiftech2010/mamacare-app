import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Activity, Video, BookOpen, ArrowRight, ChevronLeft, ChevronRight,
  Star, Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const carouselImages = [
  {
    image: '/carousel-1.jpg',
    title: 'Expecting Together',
    description: 'Supporting couples through the beautiful journey of pregnancy',
  },
  {
    image: '/carousel-2.jpg',
    title: 'New Beginnings',
    description: 'Celebrating the miracle of new life',
  },
  {
    image: '/carousel-3.jpg',
    title: 'Expert Care',
    description: 'Professional healthcare providers dedicated to maternal wellness',
  },
  {
    image: '/carousel-4.jpg',
    title: 'Education & Support',
    description: 'Empowering mothers with knowledge and community',
  },
  {
    image: '/carousel-5.jpg',
    title: 'Joyful Moments',
    description: 'Celebrating healthy deliveries with families',
  },
];

const testimonials = [
  { id: 1, name: 'Amara Okafor', location: 'Lagos, Nigeria', quote: 'Mamacare helped me identify high blood sugar early. The AI assessment was accurate and the recommendations saved my pregnancy.', avatar: 'AO', rating: 5 },
  { id: 2, name: 'Fatima Abdullahi', location: 'Kano, Nigeria', quote: 'The telemedicine feature connected me with a specialist when I needed it most. I felt supported throughout my journey.', avatar: 'FA', rating: 5 },
  { id: 3, name: 'Zanele Mthembu', location: 'Durban, South Africa', quote: 'As a first-time mother, the educational resources were invaluable. I learned so much about prenatal care.', avatar: 'ZM', rating: 5 },
  { id: 4, name: 'Amina Hassan', location: 'Nairobi, Kenya', quote: 'The risk assessment gave me peace of mind. Knowing my health status helped me make better decisions.', avatar: 'AH', rating: 5 },
  { id: 5, name: 'Yewande Adeleke', location: 'Ibadan, Nigeria', quote: 'I love the wearable device concepts! The Guardian Watch would be perfect for monitoring my vitals.', avatar: 'YA', rating: 5 },
  { id: 6, name: 'Grace Mwangi', location: 'Mombasa, Kenya', quote: 'Multilingual support made all the difference. I could use the app in Swahili and understand everything clearly.', avatar: 'GM', rating: 5 },
];

const faqItems = [
  { question: 'How accurate is the AI risk assessment?', answer: 'Our LightGBM model has been validated with 84% accuracy and 87% recall for high-risk cases, making it highly reliable for early detection of maternal health complications.' },
  { question: 'Is my health data secure?', answer: 'Absolutely. We use end-to-end encryption and comply with global health data privacy standards. Your data is never shared without your explicit consent.' },
  { question: 'Can I use MamaCare without wearable devices?', answer: 'Yes! You can manually enter your vital signs and symptoms. Wearable devices are optional and enhance continuous monitoring capabilities.' },
  { question: 'How do I connect with a healthcare provider?', answer: 'Simply use our telemedicine feature to schedule video consultations or chat with certified maternal health specialists available 24/7.' },
  { question: 'What languages does MamaCare support?', answer: 'Mamacare supports 9 languages including English, Yoruba, Hausa, Igbo, Zulu, Swahili, French, Portuguese, and Arabic.' },
  { question: 'Is MamaCare free to use?', answer: 'Yes, the basic risk assessment and educational resources are free. Premium features like unlimited telemedicine consultations are available through affordable subscription plans.' },
];

export default function Home() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.2,
      });
      gsap.from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 0.4,
      });
      gsap.from('.hero-buttons', {
        scale: 0,
        opacity: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
        delay: 0.8,
      });

      gsap.utils.toArray<HTMLElement>('.scroll-reveal').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        });
      });

      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 70%',
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });
    });

    return () => ctx.revert();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Carousel */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16">
        {/* Carousel Background */}
        <div className="absolute inset-0">
          {carouselImages.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-mamacare-charcoal/80 via-mamacare-charcoal/50 to-transparent" />
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-mamacare-coral w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="space-y-6">
              <h1 className="hero-title font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                {t('heroTitle')}
              </h1>
              <p className="hero-subtitle font-display text-2xl sm:text-3xl text-mamacare-coral font-medium">
                {t('heroSubtitle')}
              </p>
              <p className="text-lg text-white/80 max-w-lg leading-relaxed">
                {carouselImages[currentSlide].description}
              </p>
            </div>

            <div className="hero-buttons flex flex-wrap gap-4 mt-10">
              <Link to="/assessment">
                <Button className="bg-mamacare-coral hover:bg-mamacare-coral-dark text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                  {t('startJourney')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/education">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-mamacare-charcoal px-8 py-6 text-lg rounded-full transition-all">
                  {t('learnMore')}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12">
              <div className="text-center">
                <p className="font-display text-4xl font-bold text-mamacare-coral">84%</p>
                <p className="text-sm text-white/70">{t('aiAccuracy')}</p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl font-bold text-mamacare-coral">9</p>
                <p className="text-sm text-white/70">{t('languages')}</p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl font-bold text-mamacare-coral">24/7</p>
                <p className="text-sm text-white/70">{t('support')}</p>
              </div>
              <div className="text-center">
                <p className="font-display text-4xl font-bold text-mamacare-coral">10K+</p>
                <p className="text-sm text-white/70">{t('mothersHelped')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-mamacare-charcoal mb-4">
              {t('comprehensiveCare')}
            </h2>
            <p className="text-lg text-mamacare-dark-grey max-w-2xl mx-auto">
              {t('careSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="feature-card card-lift bg-white border-none shadow-lg overflow-hidden group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-mamacare-coral/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-mamacare-coral group-hover:scale-110 transition-all">
                  <Activity className="w-8 h-8 text-mamacare-coral group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display text-2xl font-bold text-mamacare-charcoal mb-3">{t('aiAssessment')}</h3>
                <p className="text-mamacare-dark-grey leading-relaxed">{t('aiAssessmentDesc')}</p>
                <Link to="/assessment" className="inline-flex items-center gap-2 text-mamacare-coral mt-4 hover:underline">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="feature-card card-lift bg-white border-none shadow-lg overflow-hidden group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-mamacare-coral/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-mamacare-coral group-hover:scale-110 transition-all">
                  <Video className="w-8 h-8 text-mamacare-coral group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display text-2xl font-bold text-mamacare-charcoal mb-3">{t('telemedicineTitle')}</h3>
                <p className="text-mamacare-dark-grey leading-relaxed">{t('telemedicineDesc')}</p>
                <Link to="/telemedicine" className="inline-flex items-center gap-2 text-mamacare-coral mt-4 hover:underline">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="feature-card card-lift bg-white border-none shadow-lg overflow-hidden group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-mamacare-coral/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-mamacare-coral group-hover:scale-110 transition-all">
                  <BookOpen className="w-8 h-8 text-mamacare-coral group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display text-2xl font-bold text-mamacare-charcoal mb-3">{t('educationHub')}</h3>
                <p className="text-mamacare-dark-grey leading-relaxed">{t('educationHubDesc')}</p>
                <Link to="/education" className="inline-flex items-center gap-2 text-mamacare-coral mt-4 hover:underline">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-mamacare-champagne/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-mamacare-charcoal mb-4">
              {t('howItWorks')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: t('step1Title'), desc: t('step1Desc') },
              { step: '2', title: t('step2Title'), desc: t('step2Desc') },
              { step: '3', title: t('step3Title'), desc: t('step3Desc') },
            ].map((item, idx) => (
              <div key={idx} className="relative text-center scroll-reveal">
                <div className="w-20 h-20 bg-mamacare-coral rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="font-display text-3xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-mamacare-charcoal mb-3">{item.title}</h3>
                <p className="text-mamacare-dark-grey">{item.desc}</p>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full">
                    <ArrowRight className="w-8 h-8 text-mamacare-coral/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-mamacare-charcoal mb-4">
              {t('whatMothersSay')}
            </h2>
          </div>

          <div className="relative">
            <div className="flex gap-6 animate-marquee">
              {[...testimonials, ...testimonials].map((testimonial, idx) => (
                <Card key={idx} className="flex-shrink-0 w-80 bg-white border border-mamacare-champagne card-lift">
                  <CardContent className="p-6">
                    <Quote className="w-8 h-8 text-mamacare-coral/30 mb-4" />
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-mamacare-dark-grey mb-6 leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-mamacare-coral/10 rounded-full flex items-center justify-center">
                        <span className="font-display font-bold text-mamacare-coral">{testimonial.avatar}</span>
                      </div>
                      <div>
                        <p className="font-medium text-mamacare-charcoal">{testimonial.name}</p>
                        <p className="text-sm text-mamacare-dark-grey">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-mamacare-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-mamacare-charcoal mb-4">
              {t('commonQuestions')}
            </h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm scroll-reveal">
                <h3 className="font-display text-lg font-semibold text-mamacare-charcoal mb-2">{item.question}</h3>
                <p className="text-mamacare-dark-grey">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/cta-background.jpg" alt="Mother and baby" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-mamacare-charcoal/70" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="scroll-reveal">
            <Heart className="w-16 h-16 text-mamacare-coral mx-auto mb-6" />
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t('startToday')}
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {t('ctaSubtitle')}
            </p>
            <Link to="/register">
              <Button className="bg-mamacare-coral hover:bg-mamacare-coral-dark text-white px-12 py-8 text-xl rounded-full shadow-lg hover:shadow-xl transition-all">
                <Heart className="w-6 h-6 mr-3 fill-white" />
                {t('downloadApp')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
