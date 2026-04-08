import { Download, Apple, Send, ExternalLink, Smartphone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Downloads() {
  const downloadLinks = [
    {
      title: 'Expo Go (Easiest)',
      description: 'Test MamaCare immediately without installation',
      icon: Zap,
      steps: [
        '1. Download Expo Go from App Store or Google Play',
        '2. Open Expo Go app',
        '3. Scan QR code below or search for "MamaCareMobile"',
      ],
      qrCode: 'https://qr.expo.dev/eas?slug=mamacare-mobile',
      buttonText: 'View in Expo Go',
      buttonUrl: 'exp://mamacare-mobile',
    },
    {
      title: 'Google Play Store',
      description: 'Official Android app (Coming Soon)',
      icon: Send,
      steps: [
        '1. Open Google Play Store',
        '2. Search for "MamaCare"',
        '3. Tap Install',
      ],
      buttonText: 'Coming Soon',
      buttonUrl: '#',
      disabled: true,
    },
    {
      title: 'Apple App Store',
      description: 'Official iOS app (Coming Soon)',
      icon: Apple,
      steps: [
        '1. Open App Store',
        '2. Search for "MamaCare"',
        '3. Tap Get',
      ],
      buttonText: 'Coming Soon',
      buttonUrl: '#',
      disabled: true,
    },
  ];

  const features = [
    {
      title: 'AI Risk Assessment',
      description: 'Get personalized maternal health risk assessments powered by AI',
    },
    {
      title: 'Telemedicine',
      description: 'Connect with certified maternal health specialists anytime, anywhere',
    },
    {
      title: 'Education Hub',
      description: 'Access comprehensive pregnancy guides and health tips',
    },
    {
      title: 'Wearable Integration',
      description: 'Sync with health tracking devices for continuous monitoring',
    },
    {
      title: 'Multi-Language Support',
      description: 'Available in 10 languages including English, Yoruba, Swahili, and Arabic',
    },
    {
      title: 'AI Chat Assistant',
      description: 'Ask our AI bot questions about pregnancy, nutrition, and more',
    },
  ];

  const requirements = {
    android: {
      name: 'Android',
      minVersion: 'Android 5.0+',
      size: '~50 MB',
      ram: '2 GB RAM minimum',
    },
    ios: {
      name: 'iOS',
      minVersion: 'iOS 13.0+',
      size: '~45 MB',
      ram: '2 GB RAM minimum',
    },
  };

  return (
    <div className="min-h-screen py-24 bg-gradient-to-br from-mamacare-champagne via-white to-mamacare-champagne">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-mamacare-charcoal mb-4">
            Download MamaCare
          </h1>
          <p className="text-xl text-gray-600">
            Get access to your maternal health assistant on any device
          </p>
        </div>

        {/* Download Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {downloadLinks.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <Card key={index} className="shadow-lg border-none">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-8 h-8 text-mamacare-coral" />
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{option.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Steps:</p>
                    {option.steps.map((step, stepIndex) => (
                      <p key={stepIndex} className="text-sm text-gray-600">
                        {step}
                      </p>
                    ))}
                  </div>

                  {option.qrCode && (
                    <div className="flex justify-center py-4">
                      <img
                        src={option.qrCode}
                        alt="Expo QR Code"
                        className="w-32 h-32 border-2 border-gray-200 rounded-lg"
                      />
                    </div>
                  )}

                  <Button
                    className={`w-full flex items-center gap-2 justify-center ${
                      option.disabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-mamacare-coral hover:bg-mamacare-coral-dark'
                    }`}
                    disabled={option.disabled}
                    onClick={() => {
                      if (!option.disabled && option.buttonUrl !== '#') {
                        window.open(option.buttonUrl, '_blank');
                      }
                    }}
                  >
                    <Download className="w-4 h-4" />
                    {option.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="font-display text-3xl font-bold text-mamacare-charcoal mb-8 text-center">
            What's Inside MamaCare
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardContent className="p- 6">
                  <h3 className="font-semibold text-lg text-mamacare-charcoal mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* System Requirements */}
        <div className="mb-16">
          <h2 className="font-display text-3xl font-bold text-mamacare-charcoal mb-8 text-center">
            System Requirements
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(requirements).map(([key, req]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-mamacare-coral" />
                    {req.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Minimum Version</p>
                    <p className="font-semibold">{req.minVersion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">App Size</p>
                    <p className="font-semibold">{req.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recommended RAM</p>
                    <p className="font-semibold">{req.ram}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="font-display text-3xl font-bold text-mamacare-charcoal mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is MamaCare free to use?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! MamaCare is completely free. AI assessments and educational content are available
                  to all users. Premium telemedicine consultations may have associated costs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my health data secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Absolutely. Your health data is encrypted and stored securely. We comply with international
                  health data privacy standards and never share your information without consent.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do I need an internet connection?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, MamaCare requires an internet connection for most features. However, some educational
                  content can be downloaded for offline access.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  What languages does MamaCare support?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  MamaCare supports 10 languages: English, Yoruba, Hausa, Igbo, Fulfude, Zulu, Swahili, French,
                  Portuguese, and Arabic.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do I contact support?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You can reach our support team through the app's help section or email us at
                  support@mamacare.app. We typically respond within 24 hours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-red-400 to-pink-400 rounded-2xl p-12 text-center text-white mb-16">
          <h2 className="font-display text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-6">
            Download MamaCare today and take control of your maternal health journey
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              className="bg-white text-mamacare-coral hover:bg-gray-100 flex items-center gap-2"
              onClick={() => window.open('exp://mamacare-mobile', '_blank')}
            >
              <Download className="w-4 h-4" />
              Download via Expo Go
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/20 flex items-center gap-2"
              onClick={() => window.scrollTo(0, 0)}
            >
              <ExternalLink className="w-4 h-4" />
              Go to Web App
            </Button>
          </div>
        </div>

        {/* Trust Section */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Trusted by thousands of mothers across Africa
          </p>
          <p className="text-sm text-gray-500">
            MamaCare is built with ❤️ to support maternal health and wellness
          </p>
        </div>
      </div>
    </div>
  );
}
