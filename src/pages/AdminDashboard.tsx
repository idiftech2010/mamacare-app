import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Activity, Stethoscope, Calendar,
  Plus, Edit2, Trash2, X, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API_BASE_URL = 'https://mamacare-backend-n1z7.onrender.com/api';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  bio: string;
  education: string;
  experience: number;
  consultationFee: number;
  languages: string[];
  ethnicity: 'black' | 'arab' | 'white' | 'asian';
  available: boolean;
  image: string;
  rating: number;
  reviews: number;
  nextAvailable: string;
  certifications: string[];
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: string;
  lastLogin?: string;
  phone?: string;
}

interface RecordData {
  id: string;
  userId: string;
  user?: UserData;
  timestamp: string;
  result: {
    level: 'low' | 'medium' | 'high';
    score: number;
  };
}

interface Stats {
  totalUsers: number;
  totalAssessments: number;
  totalDoctors: number;
  totalAppointments: number;
  riskDistribution: { low: number; medium: number; high: number };
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { getToken, isSuperadmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'records' | 'doctors'>('dashboard');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [records, setRecords] = useState<RecordData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    const token = getToken();
    
    try {
      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch doctors
      const doctorsRes = await fetch(`${API_BASE_URL}/doctors`);
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        setDoctors(doctorsData);
      }

      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // Fetch records
      const recordsRes = await fetch(`${API_BASE_URL}/admin/records`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setRecords(recordsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/admin/doctors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setDoctors(doctors.filter(d => d.id !== id));
        toast.success('Doctor deleted successfully');
      } else {
        toast.error('Failed to delete doctor');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleAssignRole = async (userId: string, newRole: 'user' | 'admin') => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success(`Role updated to ${newRole}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update role');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleSaveDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getToken();
    const formData = new FormData(e.currentTarget);
    
    const doctorData: Partial<Doctor> = {
      name: formData.get('name') as string,
      specialty: formData.get('specialty') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      bio: formData.get('bio') as string,
      education: formData.get('education') as string,
      experience: parseInt(formData.get('experience') as string),
      consultationFee: parseInt(formData.get('consultationFee') as string),
      languages: (formData.get('languages') as string).split(',').map(s => s.trim()),
      ethnicity: formData.get('ethnicity') as Doctor['ethnicity'],
      available: formData.get('available') === 'on',
    };

    try {
      const response = await fetch(`${API_BASE_URL}/admin/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingDoctor ? { ...doctorData, id: editingDoctor.id } : doctorData),
      });

      if (response.ok) {
        const savedDoctor = await response.json();
        if (editingDoctor) {
          setDoctors(doctors.map(d => d.id === editingDoctor.id ? savedDoctor : d));
          toast.success('Doctor updated successfully');
        } else {
          setDoctors([...doctors, savedDoctor]);
          toast.success('Doctor added successfully');
        }
        setShowDoctorForm(false);
        setEditingDoctor(null);
      } else {
        toast.error('Failed to save doctor');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={fetchAllData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('totalUsers')}</p>
                <p className="font-display text-3xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="w-10 h-10 text-mamacare-coral" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('totalAssessments')}</p>
                <p className="font-display text-3xl font-bold">{stats?.totalAssessments || 0}</p>
              </div>
              <Activity className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('totalDoctors')}</p>
                <p className="font-display text-3xl font-bold">{stats?.totalDoctors || doctors.length}</p>
              </div>
              <Stethoscope className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{t('totalAppointments')}</p>
                <p className="font-display text-3xl font-bold">{stats?.totalAppointments || 0}</p>
              </div>
              <Calendar className="w-10 h-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>{t('riskDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-8">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-8 border-green-500 flex items-center justify-center">
                <div>
                  <p className="font-display text-2xl font-bold">{stats?.riskDistribution?.low || 0}</p>
                  <p className="text-sm text-gray-500">{t('lowRisk')}</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-8 border-amber-500 flex items-center justify-center">
                <div>
                  <p className="font-display text-2xl font-bold">{stats?.riskDistribution?.medium || 0}</p>
                  <p className="text-sm text-gray-500">{t('mediumRisk')}</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-8 border-red-500 flex items-center justify-center">
                <div>
                  <p className="font-display text-2xl font-bold">{stats?.riskDistribution?.high || 0}</p>
                  <p className="text-sm text-gray-500">{t('highRisk')}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {records.slice(0, 5).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{record.user?.name || 'Unknown User'}</p>
                  <p className="text-sm text-gray-500">{new Date(record.timestamp).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  record.result.level === 'low' ? 'bg-green-100 text-green-700' :
                  record.result.level === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {record.result.level} ({record.result.score})
                </span>
              </div>
            ))}
            {records.length === 0 && (
              <p className="text-gray-500 text-center py-4">No assessment records yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('users')} ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                {user.phone && <p className="text-sm text-gray-400">{user.phone}</p>}
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  user.role === 'superadmin' ? 'bg-red-100 text-red-700' :
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </p>
                {/* Role assignment buttons for superadmin */}
                {isSuperadmin && user.role !== 'superadmin' && (
                  <div className="mt-2 flex gap-2 justify-end">
                    <button
                      onClick={() => handleAssignRole(user.id, 'user')}
                      className={`px-2 py-1 text-xs rounded ${
                        user.role === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                      disabled={user.role === 'user'}
                    >
                      User
                    </button>
                    <button
                      onClick={() => handleAssignRole(user.id, 'admin')}
                      className={`px-2 py-1 text-xs rounded ${
                        user.role === 'admin' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                      disabled={user.role === 'admin'}
                    >
                      Admin
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-gray-500 text-center py-4">No users registered yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderRecords = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('records')} ({records.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{record.user?.name || 'Unknown User'}</p>
                <p className="text-sm text-gray-500">{new Date(record.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm">Score: {record.result.score}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  record.result.level === 'low' ? 'bg-green-100 text-green-700' :
                  record.result.level === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {record.result.level}
                </span>
              </div>
            </div>
          ))}
          {records.length === 0 && (
            <p className="text-gray-500 text-center py-4">No assessment records yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDoctors = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">{t('doctors')}</h2>
        <Button
          onClick={() => { setEditingDoctor(null); setShowDoctorForm(true); }}
          className="bg-mamacare-coral hover:bg-mamacare-coral-dark"
        >
          <Plus className="w-4 h-4 mr-2" /> {t('addDoctor')}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold">{doctor.name}</h3>
                  <p className="text-sm text-gray-500">{doctor.specialty}</p>
                  <p className="text-sm text-gray-400">{doctor.email}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doctor.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {doctor.available ? t('available') : t('unavailable')}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEditingDoctor(doctor); setShowDoctorForm(true); }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => handleDeleteDoctor(doctor.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showDoctorForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold">
                {editingDoctor ? t('editDoctor') : t('addDoctor')}
              </h3>
              <button onClick={() => setShowDoctorForm(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSaveDoctor} className="space-y-4">
              <div>
                <Label>{t('name')}</Label>
                <Input name="name" defaultValue={editingDoctor?.name} required />
              </div>
              <div>
                <Label>{t('specialty')}</Label>
                <Input name="specialty" defaultValue={editingDoctor?.specialty} required />
              </div>
              <div>
                <Label>{t('email')}</Label>
                <Input name="email" type="email" defaultValue={editingDoctor?.email} required />
              </div>
              <div>
                <Label>{t('phone')}</Label>
                <Input name="phone" defaultValue={editingDoctor?.phone} required />
              </div>
              <div>
                <Label>Bio</Label>
                <textarea
                  name="bio"
                  defaultValue={editingDoctor?.bio}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <Label>Education</Label>
                <Input name="education" defaultValue={editingDoctor?.education} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Experience (years)</Label>
                  <Input name="experience" type="number" defaultValue={editingDoctor?.experience} />
                </div>
                <div>
                  <Label>Consultation Fee (₦)</Label>
                  <Input name="consultationFee" type="number" defaultValue={editingDoctor?.consultationFee} />
                </div>
              </div>
              <div>
                <Label>{t('languagesSpoken')} (comma separated)</Label>
                <Input name="languages" defaultValue={editingDoctor?.languages.join(', ')} />
              </div>
              <div>
                <Label>Ethnicity</Label>
                <select name="ethnicity" defaultValue={editingDoctor?.ethnicity} className="w-full px-3 py-2 border rounded-lg">
                  <option value="black">Black</option>
                  <option value="arab">Arab</option>
                  <option value="white">White</option>
                  <option value="asian">Asian</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="available" defaultChecked={editingDoctor?.available} />
                <span>Available for appointments</span>
              </label>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDoctorForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-mamacare-coral hover:bg-mamacare-coral-dark">
                  {editingDoctor ? 'Update' : 'Add'} Doctor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen py-24 bg-mamacare-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-mamacare-coral mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 bg-mamacare-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-mamacare-charcoal mb-8">{t('admin')}</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
            { id: 'users', label: t('users'), icon: Users },
            { id: 'records', label: t('records'), icon: Activity },
            { id: 'doctors', label: t('doctors'), icon: Stethoscope },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-mamacare-coral text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'records' && renderRecords()}
        {activeTab === 'doctors' && renderDoctors()}
      </div>
    </div>
  );
}
