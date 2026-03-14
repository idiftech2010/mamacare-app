import { useState } from 'react';
import { AlertTriangle, Phone, X, Ambulance, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface EmergencyContact {
  name: string;
  number: string;
  type: 'ambulance' | 'hospital' | 'emergency';
}

const emergencyContacts: EmergencyContact[] = [
  { name: 'National Emergency', number: '112', type: 'emergency' },
  { name: 'Ambulance Service', number: '911', type: 'ambulance' },
  { name: 'Lagos University Teaching Hospital', number: '+234 1 493 0000', type: 'hospital' },
  { name: 'Red Cross Emergency', number: '+234 809 000 0000', type: 'emergency' },
  { name: 'Police Emergency', number: '199', type: 'emergency' },
  { name: 'Fire Service', number: '199', type: 'emergency' },
];

export default function EmergencyButton() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
    toast.success(`Calling ${number}...`);
  };

  const handleAmbulanceRequest = async () => {
    setIsRequesting(true);
    
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          toast.success('Ambulance requested! Your location has been shared.', {
            description: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
          });
          
          // In production, this would send the request to the backend
          console.log('Ambulance request:', {
            location: { lat: latitude, lng: longitude },
            timestamp: new Date().toISOString(),
          });
          
          setTimeout(() => {
            setIsRequesting(false);
            toast.info('An ambulance has been dispatched to your location.');
          }, 3000);
        },
        () => {
          toast.error('Could not get your location. Please enable location services.');
          setIsRequesting(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
      setIsRequesting(false);
    }
  };

  return (
    <>
      {/* Emergency Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors animate-pulse"
      >
        <AlertTriangle className="w-4 h-4" />
        <span className="hidden sm:inline">{t('emergency') || 'Emergency'}</span>
      </button>

      {/* Emergency Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto">
            {/* Header */}
            <div className="bg-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{t('emergencyTitle') || 'Emergency Services'}</h2>
                    <p className="text-red-100 text-sm">{t('emergencySubtitle') || 'Get help immediately'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Ambulance Request */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <Ambulance className="w-5 h-5" />
                  {t('requestAmbulance') || 'Request Ambulance'}
                </h3>
                <p className="text-sm text-red-600 mb-4">
                  {t('ambulanceDesc') || 'Your location will be shared with emergency services'}
                </p>
                <Button
                  onClick={handleAmbulanceRequest}
                  disabled={isRequesting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {isRequesting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      {t('requesting') || 'Requesting...'}
                    </>
                  ) : (
                    <>
                      <Ambulance className="w-4 h-4 mr-2" />
                      {t('callAmbulance') || 'Call Ambulance Now'}
                    </>
                  )}
                </Button>
              </div>

              {/* Emergency Contacts */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  {t('emergencyContacts') || 'Emergency Contacts'}
                </h3>
                <div className="space-y-2">
                  {emergencyContacts.map((contact, index) => (
                    <button
                      key={index}
                      onClick={() => handleCall(contact.number)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          contact.type === 'ambulance' ? 'bg-red-100 text-red-600' :
                          contact.type === 'hospital' ? 'bg-blue-100 text-blue-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {contact.type === 'ambulance' ? <Ambulance className="w-5 h-5" /> :
                           contact.type === 'hospital' ? <MapPin className="w-5 h-5" /> :
                           <Phone className="w-5 h-5" />}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-800">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.number}</p>
                        </div>
                      </div>
                      <Phone className="w-5 h-5 text-green-600" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>{t('note') || 'Note:'}</strong> {t('emergencyNote') || 'In case of life-threatening emergency, call your local emergency number immediately.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
