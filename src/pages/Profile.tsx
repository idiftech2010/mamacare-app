import { useState } from 'react';
import { 
  User, Mail, Phone, Calendar, Droplets, Pill, AlertCircle,
  Activity, CalendarCheck, Edit2, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

// Mock assessment history
const mockAssessments = [
  { id: 1, date: '2025-02-15', level: 'low', score: 15 },
  { id: 2, date: '2025-02-01', level: 'low', score: 20 },
  { id: 3, date: '2025-01-15', level: 'medium', score: 35 },
];

// Mock appointments
const mockAppointments = [
  { id: 1, doctor: 'Dr. Amara Okafor', date: '2025-02-25', time: '10:00 AM', type: 'Video', status: 'confirmed' },
  { id: 2, doctor: 'Dr. Fatima Al-Rashid', date: '2025-03-05', time: '2:00 PM', type: 'In-person', status: 'pending' },
];

export default function Profile() {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    age: user?.profile?.age || '',
    dueDate: user?.profile?.dueDate || '',
    bloodType: user?.profile?.bloodType || '',
    allergies: user?.profile?.allergies?.join(', ') || '',
    medications: user?.profile?.medications?.join(', ') || '',
  });

  const handleSave = async () => {
    const success = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      profile: {
        age: parseInt(formData.age as string) || undefined,
        dueDate: formData.dueDate || undefined,
        bloodType: formData.bloodType || undefined,
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
        medications: formData.medications.split(',').map(s => s.trim()).filter(Boolean),
      },
    });
    
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen py-24 bg-mamacare-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-mamacare-charcoal">{t('myProfile')}</h1>
          <Button
            variant={isEditing ? 'default' : 'outline'}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={isEditing ? 'bg-mamacare-coral hover:bg-mamacare-coral-dark' : ''}
          >
            {isEditing ? <><Save className="w-4 h-4 mr-2" /> {t('saveChanges')}</> : <><Edit2 className="w-4 h-4 mr-2" /> {t('editProfile')}</>}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 bg-mamacare-coral rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">{user?.name.charAt(0).toUpperCase()}</span>
              </div>
              <h2 className="font-display text-xl font-semibold">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  {user?.role === 'admin' ? 'Administrator' : 'Member'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">{t('personalInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2"><User className="w-4 h-4" /> {t('name')}</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><Mail className="w-4 h-4" /> {t('email')}</Label>
                    <Input
                      value={formData.email}
                      disabled
                      className="mt-1 bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><Phone className="w-4 h-4" /> {t('phone')}</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><User className="w-4 h-4" /> Age</Label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pregnancy Info */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">{t('pregnancyInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {t('dueDate')}</Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><Droplets className="w-4 h-4" /> {t('bloodType')}</Label>
                    <Input
                      value={formData.bloodType}
                      onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="e.g., O+"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {t('allergies')}</Label>
                    <Input
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="Separate with commas"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="flex items-center gap-2"><Pill className="w-4 h-4" /> {t('medications')}</Label>
                    <Input
                      value={formData.medications}
                      onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="Separate with commas"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assessment History */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" /> {t('assessmentHistory')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAssessments.map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{assessment.date}</p>
                        <p className="text-sm text-gray-500">Risk Score: {assessment.score}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        assessment.level === 'low' ? 'bg-green-100 text-green-700' :
                        assessment.level === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {assessment.level.charAt(0).toUpperCase() + assessment.level.slice(1)} Risk
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5" /> {t('myAppointments')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{apt.doctor}</p>
                        <p className="text-sm text-gray-500">{apt.date} at {apt.time} • {apt.type}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
