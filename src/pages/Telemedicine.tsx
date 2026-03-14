import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Video, MessageCircle, Calendar, Star, Search,
  Clock, MapPin, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { doctors, type Doctor } from '@/data/doctors';
import { toast } from 'sonner';

export default function Telemedicine() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEthnicity, setSelectedEthnicity] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEthnicity = selectedEthnicity === 'all' || doctor.ethnicity === selectedEthnicity;
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesEthnicity && matchesSpecialty;
  });

  const specialties = [...new Set(doctors.map(d => d.specialty))];

  const handleBookAppointment = (doctor: Doctor) => {
    toast.success(`Appointment request sent to ${doctor.name}. They will contact you shortly.`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 bg-mamacare-dark-grey">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t('connectExperts')}
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              {t('telemedicineSubtitle')}
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Video className="w-12 h-12 text-mamacare-coral mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-white mb-2">{t('videoConsult')}</h3>
                <p className="text-white/60">Face-to-face consultations with maternal health specialists</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-mamacare-coral mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-white mb-2">{t('chatSupport')}</h3>
                <p className="text-white/60">24/7 chat support for immediate health concerns</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 text-mamacare-coral mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-white mb-2">{t('appointmentBooking')}</h3>
                <p className="text-white/60">Easy scheduling for in-person visits</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Doctors List */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-mamacare-charcoal mb-8">{t('ourDoctors')}</h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedEthnicity}
              onChange={(e) => setSelectedEthnicity(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mamacare-coral focus:border-transparent"
            >
              <option value="all">All Ethnicities</option>
              <option value="black">Black</option>
              <option value="arab">Arab</option>
              <option value="white">White</option>
              <option value="asian">Asian</option>
            </select>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-mamacare-coral focus:border-transparent"
            >
              <option value="all">All Specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Doctors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden card-lift border-mamacare-champagne">
                <div className="relative">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                    doctor.available ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {doctor.available ? t('available') : t('unavailable')}
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-mamacare-charcoal">{doctor.name}</h3>
                      <p className="text-mamacare-coral">{doctor.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium">{doctor.rating}</span>
                      <span className="text-sm text-gray-400">({doctor.reviews})</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doctor.bio}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      {doctor.languages.join(', ')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {doctor.education}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {doctor.experience} years experience
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">{t('nextAvailable')}</p>
                      <p className="font-medium text-mamacare-charcoal">{doctor.nextAvailable}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/doctors/${doctor.id}`}>
                        <Button variant="outline" size="sm">
                          {t('viewProfile')}
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="bg-mamacare-coral hover:bg-mamacare-coral-dark text-white"
                        onClick={() => handleBookAppointment(doctor)}
                        disabled={!doctor.available}
                      >
                        {t('bookAppointment')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
