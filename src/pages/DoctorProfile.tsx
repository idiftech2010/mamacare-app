import { useParams, Link } from 'react-router-dom';
import { 
  Star, Globe, Clock, Mail, Phone, GraduationCap,
  Award, Calendar, ArrowLeft, Video, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDoctorById } from '@/data/doctors';
import { toast } from 'sonner';

export default function DoctorProfile() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const doctor = getDoctorById(id || '');

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-gray-600">Doctor not found</h1>
          <Link to="/telemedicine" className="text-mamacare-coral hover:underline mt-4 inline-block">
            Back to Telemedicine
          </Link>
        </div>
      </div>
    );
  }

  const handleBookAppointment = () => {
    toast.success(`Appointment request sent to ${doctor.name}. They will contact you shortly.`);
  };

  return (
    <div className="min-h-screen py-24 bg-mamacare-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link to="/telemedicine" className="inline-flex items-center gap-2 text-gray-600 hover:text-mamacare-coral mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Doctors
        </Link>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-32 h-32 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="font-display text-3xl font-bold text-mamacare-charcoal">{doctor.name}</h1>
                    <p className="text-mamacare-coral text-lg">{doctor.specialty}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    doctor.available ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {doctor.available ? t('available') : t('unavailable')}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="font-semibold">{doctor.rating}</span>
                    <span className="text-gray-500">({doctor.reviews} reviews)</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    {doctor.experience} years experience
                  </div>
                </div>

                <p className="text-gray-600 mt-4">{doctor.bio}</p>

                <div className="flex flex-wrap gap-3 mt-6">
                  <Button
                    className="bg-mamacare-coral hover:bg-mamacare-coral-dark text-white"
                    onClick={handleBookAppointment}
                    disabled={!doctor.available}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('bookAppointment')}
                  </Button>
                  <Button variant="outline">
                    <Video className="w-4 h-4 mr-2" />
                    Video Consult
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Info Cards */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-semibold mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-semibold mb-4">Education & Certifications</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-mamacare-coral mt-0.5" />
                    <div>
                      <p className="font-medium">{doctor.education}</p>
                      <p className="text-sm text-gray-500">Medical Degree</p>
                    </div>
                  </div>
                  {doctor.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-mamacare-coral mt-0.5" />
                      <div>
                        <p className="font-medium">{cert}</p>
                        <p className="text-sm text-gray-500">Certification</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-semibold mb-4">Availability</h2>
                <div className="space-y-3">
                  {doctor.availability.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{slot.day}</span>
                      <div className="flex gap-2">
                        {slot.slots.map((time, tidx) => (
                          <span key={tidx} className="px-3 py-1 bg-white rounded text-sm">{time}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-mamacare-coral" />
                    <span className="text-sm">{doctor.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-mamacare-coral" />
                    <span className="text-sm">{doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-mamacare-coral" />
                    <span className="text-sm">{doctor.languages.join(', ')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Consultation Fee</h2>
                <p className="font-display text-3xl font-bold text-mamacare-coral">
                  ₦{doctor.consultationFee.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">per session</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Next Available</h2>
                <p className="text-lg font-medium">{doctor.nextAvailable}</p>
                <Button className="w-full mt-4 bg-mamacare-coral hover:bg-mamacare-coral-dark" onClick={handleBookAppointment}>
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
