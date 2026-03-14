import { useState } from 'react';
import { 
  Heart, Activity, Moon, Zap, Droplets, Thermometer,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const wearableDevices = [
  {
    id: 'guardian-watch',
    name: 'Guardian Watch',
    description: 'Continuous vital tracking with African-inspired design',
    image: '/guardian-watch.png',
    features: [
      { icon: Heart, text: '24/7 Heart rate monitoring' },
      { icon: Activity, text: 'Blood pressure tracking' },
      { icon: Moon, text: 'Sleep analysis & insights' },
      { icon: Zap, text: 'Emergency SOS button' },
    ],
    specs: {
      battery: '7 days',
      waterResistance: 'IP68',
      connectivity: 'Bluetooth 5.0, WiFi',
    },
    price: '₦45,000',
  },
  {
    id: 'unity-band',
    name: 'Unity Band',
    description: 'Activity and sleep monitoring for holistic wellness',
    image: '/unity-band.png',
    features: [
      { icon: Activity, text: 'Step counting & distance' },
      { icon: Zap, text: 'Calorie tracking' },
      { icon: Moon, text: 'Sleep stages analysis' },
      { icon: Heart, text: 'Gentle reminder alerts' },
    ],
    specs: {
      battery: '14 days',
      waterResistance: 'IP67',
      connectivity: 'Bluetooth 5.0',
    },
    price: '₦25,000',
  },
  {
    id: 'serenity-necklace',
    name: 'Serenity Necklace',
    description: 'Elegant stress and wellness tracking with mindfulness features',
    image: '/serenity-necklace.png',
    features: [
      { icon: Heart, text: 'Stress level detection' },
      { icon: Droplets, text: 'Guided breathing exercises' },
      { icon: Activity, text: 'Mindfulness prompts' },
      { icon: Zap, text: 'Daily wellness scores' },
    ],
    specs: {
      battery: '5 days',
      waterResistance: 'IPX4',
      connectivity: 'Bluetooth 5.0',
    },
    price: '₦35,000',
  },
  {
    id: 'vitality-ring',
    name: 'Vitality Ring',
    description: 'Discrete 24/7 health monitoring in a beautiful ring design',
    image: '/vitality-ring.png',
    features: [
      { icon: Heart, text: '24/7 heart rate monitoring' },
      { icon: Thermometer, text: 'Temperature tracking' },
      { icon: Activity, text: 'Activity monitoring' },
      { icon: Droplets, text: 'Water resistant design' },
    ],
    specs: {
      battery: '7 days',
      waterResistance: 'IP68',
      connectivity: 'Bluetooth 5.0',
    },
    price: '₦55,000',
  },
];

export default function Wearables() {
  const { t } = useLanguage();
  const [activeDevice, setActiveDevice] = useState(0);
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  const device = wearableDevices[activeDevice];

  const handleNotifyMe = () => {
    toast.success('You will be notified when this device becomes available!');
    setShowNotifyModal(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-mamacare-champagne via-white to-mamacare-champagne">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-mamacare-charcoal mb-6">
              {t('futureMonitoring')}
            </h1>
            <p className="text-xl text-mamacare-dark-grey max-w-2xl mx-auto">
              {t('wearablesSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Device Showcase */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Device Image */}
            <div className="relative">
              <div className="relative aspect-square max-w-md mx-auto bg-gradient-to-br from-mamacare-coral/10 to-mamacare-champagne rounded-3xl flex items-center justify-center">
                <img
                  src={device.image}
                  alt={device.name}
                  className="w-3/4 h-auto object-contain animate-float"
                />
              </div>
              
              {/* Navigation */}
              <button
                onClick={() => setActiveDevice((prev) => (prev - 1 + wearableDevices.length) % wearableDevices.length)}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-mamacare-champagne transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setActiveDevice((prev) => (prev + 1) % wearableDevices.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-mamacare-champagne transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Device Info */}
            <div className="space-y-8">
              {/* Device Tabs */}
              <div className="flex flex-wrap gap-2">
                {wearableDevices.map((d, idx) => (
                  <button
                    key={d.id}
                    onClick={() => setActiveDevice(idx)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeDevice === idx
                        ? 'bg-mamacare-coral text-white'
                        : 'bg-mamacare-champagne text-mamacare-charcoal hover:bg-mamacare-coral/20'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>

              <div>
                <h2 className="font-display text-4xl font-bold text-mamacare-charcoal mb-2">{device.name}</h2>
                <p className="text-xl text-mamacare-dark-grey">{device.description}</p>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold text-mamacare-charcoal mb-4">{t('keyFeatures')}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {device.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-mamacare-champagne/30 rounded-lg">
                      <feature.icon className="w-5 h-5 text-mamacare-coral" />
                      <span className="text-sm text-mamacare-charcoal">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specs */}
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-gray-100 rounded-lg">
                  <span className="text-xs text-gray-500">Battery</span>
                  <p className="font-medium text-mamacare-charcoal">{device.specs.battery}</p>
                </div>
                <div className="px-4 py-2 bg-gray-100 rounded-lg">
                  <span className="text-xs text-gray-500">Water Resistance</span>
                  <p className="font-medium text-mamacare-charcoal">{device.specs.waterResistance}</p>
                </div>
                <div className="px-4 py-2 bg-gray-100 rounded-lg">
                  <span className="text-xs text-gray-500">Connectivity</span>
                  <p className="font-medium text-mamacare-charcoal">{device.specs.connectivity}</p>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="flex items-center gap-6 pt-4 border-t">
                <div>
                  <span className="text-sm text-gray-500">Price</span>
                  <p className="font-display text-3xl font-bold text-mamacare-coral">{device.price}</p>
                </div>
                <Button
                  className="bg-mamacare-coral hover:bg-mamacare-coral-dark text-white px-8 py-6"
                  onClick={() => setShowNotifyModal(true)}
                >
                  {t('comingSoon')} - Notify Me
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Devices Grid */}
      <section className="py-16 bg-mamacare-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-mamacare-charcoal mb-8">All Devices</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wearableDevices.map((d) => (
              <Card key={d.id} className="overflow-hidden card-lift cursor-pointer" onClick={() => setActiveDevice(wearableDevices.findIndex(dev => dev.id === d.id))}>
                <div className="aspect-square bg-gradient-to-br from-mamacare-coral/5 to-mamacare-champagne flex items-center justify-center p-6">
                  <img src={d.image} alt={d.name} className="w-3/4 h-auto object-contain" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-display text-lg font-semibold text-mamacare-charcoal">{d.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{d.description}</p>
                  <p className="font-display text-xl font-bold text-mamacare-coral mt-2">{d.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Notify Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="font-display text-2xl font-bold text-mamacare-charcoal mb-4">Get Notified</h3>
            <p className="text-gray-600 mb-6">
              Be the first to know when the {device.name} becomes available. Enter your email to receive updates.
            </p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-mamacare-coral focus:border-transparent"
              />
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowNotifyModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-mamacare-coral hover:bg-mamacare-coral-dark text-white" onClick={handleNotifyMe}>
                  Notify Me
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
