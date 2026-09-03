import * as XLSX from 'xlsx';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Activity, Stethoscope, Calendar,
  Plus, Edit2, Trash2, X, Loader2, RefreshCw, Download, FileJson, Table2, BookOpen, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { doctors as staticDoctors } from '@/data/doctors';
import { ChartContainer, ChartTooltip, ChartLegend } from '@/components/ui/chart';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';

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
  role: 'user' | 'admin' | 'superadmin' | 'clinician' | 'data_entry';
  createdAt: string;
  lastLogin?: string;
  phone?: string;
}

const roleLabels: Record<UserData['role'], string> = {
  user: 'Patient',
  admin: 'Administrator',
  superadmin: 'Super Administrator',
  clinician: 'Clinician',
  data_entry: 'Data Entry Officer',
};

interface RecordData {
  id: string;
  userId: string;
  user?: UserData;
  timestamp: string;
  vitals?: {
    age?: number;
    systolicBP?: number;
    diastolicBP?: number;
    bloodSugar?: number;
    bodyTemp?: number;
    heartRate?: number;
  };
  pregnancyWeek?: number;
  symptoms?: string[];
  notes?: string;
  result: {
    level: 'low' | 'medium' | 'high';
    score: number;
    confidence?: number;
    factors?: string[];
    recommendations?: string[];
    vitalContributions?: Array<{ feature: string; label: string; contribution: number; reason: string; value: number; unit: string }>;
    correlations?: Array<{ symptom: string; vital: string; vitalLabel: string; vitalValue: number; vitalUnit: string; relationship: string; strength: string }>;
    deltaRisk?: number | null;
    alertStatus?: string;
    riskCategories?: Array<{ name: string; status: string; evidence: string[]; note?: string }>;
  };
  riskState?: number;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  createdAt: string;
}

interface GalleryItem {
  id: string;
  title: string;
  image: string;
  caption: string;
  createdAt: string;
}

interface WearableAdmin {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  specs: string;
  available: boolean;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalAssessments: number;
  totalDoctors: number;
  totalAppointments: number;
  riskDistribution: { low: number; medium: number; high: number };
  computationalPerformance?: {
    measuredAssessments: number;
    averageExecutionTimeMs: number;
    averageMemoryUtilizationMb: number;
  };
}

export default function AdminDashboard() {
  const { t } = useLanguage();
const { getToken, isAdmin, isSuperadmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'records' | 'doctors' | 'clinic' | 'content' | 'clinicians'>('dashboard');
  const [clinicians, setClinicians] = useState<UserData[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [records, setRecords] = useState<RecordData[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [wearables, setWearables] = useState<WearableAdmin[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [showWearableForm, setShowWearableForm] = useState(false);
  const [editingWearable, setEditingWearable] = useState<WearableAdmin | null>(null);
  const [featuredTopics, setFeaturedTopics] = useState<{
    id: string;
    title: string;
    description: string;
    category: string;
    body: string;
  }[]>([]);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<{
    id: string;
    title: string;
    description: string;
    category: string;
    body: string;
  } | null>(null);

  // Clinic access states
  const [selectedPatient, setSelectedPatient] = useState<UserData | null>(null);
  const [clinicSearchQuery, setClinicSearchQuery] = useState('');
  const [clinicSearchResults, setClinicSearchResults] = useState<UserData[]>([]);
  const [clinicIsSearching, setClinicIsSearching] = useState(false);
  const [doctorImageFile, setDoctorImageFile] = useState<File | null>(null);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    const token = getToken();
    
    try {
      if (!token) {
        toast.error('Authentication token missing. Please login again.');
        setIsLoading(false);
        return;
      }

      // Parallel fetch all data
      const [statsRes, doctorsRes, usersRes, recordsRes, postsRes, galleryRes, wearablesRes, featuredTopicsRes, cliniciansRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/doctors`),
        fetch(`${API_BASE_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/records`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/posts`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/gallery`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/wearables`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/featured-topics`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/clinicians`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      // Process stats
      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const data = await statsRes.value.json();
        setStats(data);
      } else if (statsRes.status === 'fulfilled' && statsRes.value.status === 401) {
        toast.error('Session expired. Please login again.');
        return;
      }

      // Process doctors
      if (doctorsRes.status === 'fulfilled' && doctorsRes.value.ok) {
        const data = await doctorsRes.value.json();
        // Merge API doctors with static doctors, avoiding duplicates by id
        const apiDoctorIds = new Set(data.map((d: Doctor) => d.id));
        const additionalDoctors = staticDoctors.filter(d => !apiDoctorIds.has(d.id));
        setDoctors([...data, ...additionalDoctors]);
      }

      // Process users
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const data = await usersRes.value.json();
        setUsers(data);
      }

      // Process records
      if (recordsRes.status === 'fulfilled' && recordsRes.value.ok) {
        const data = await recordsRes.value.json();
        setRecords(data);
      }

      // Process posts
      if (postsRes.status === 'fulfilled' && postsRes.value.ok) {
        const data = await postsRes.value.json();
        setPosts(data);
      }

      // Process gallery
      if (galleryRes.status === 'fulfilled' && galleryRes.value.ok) {
        const data = await galleryRes.value.json();
        setGallery(data);
      }

      // Process wearables
      if (wearablesRes.status === 'fulfilled' && wearablesRes.value.ok) {
        const data = await wearablesRes.value.json();
        setWearables(data);
      }

      // Process featured topics
      if (featuredTopicsRes.status === 'fulfilled' && featuredTopicsRes.value.ok) {
        const data = await featuredTopicsRes.value.json();
        setFeaturedTopics(data);
      }
      if (cliniciansRes.status === 'fulfilled' && cliniciansRes.value.ok) setClinicians(await cliniciansRes.value.json());

      toast.success('Dashboard data loaded');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading dashboard data');
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
    
    let imageUrl = formData.get('image') as string;
    
    // If a file was selected, convert to base64
    if (doctorImageFile) {
      imageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(doctorImageFile);
      });
    }
    
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
      image: imageUrl,
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
        setDoctorImageFile(null);
      } else {
        toast.error('Failed to save doctor');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleSavePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getToken();
    const formData = new FormData(e.currentTarget);
    const postData = {
      id: editingPost?.id,
      title: formData.get('title') as string,
      excerpt: formData.get('excerpt') as string,
      content: formData.get('content') as string,
      image: formData.get('image') as string,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/admin/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const savedPost = await response.json();
        if (editingPost) {
          setPosts(posts.map((p) => (p.id === editingPost.id ? savedPost : p)));
          toast.success('Post updated successfully');
        } else {
          setPosts([...posts, savedPost]);
          toast.success('Post added successfully');
        }
        setShowPostForm(false);
        setEditingPost(null);
      } else {
        toast.error('Failed to save post');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== postId));
        toast.success('Post deleted');
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleSaveGalleryItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getToken();
    const formData = new FormData(e.currentTarget);
    const galleryItem = {
      id: editingGalleryItem?.id,
      title: formData.get('title') as string,
      image: formData.get('image') as string,
      caption: formData.get('caption') as string,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/admin/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(galleryItem),
      });

      if (response.ok) {
        const savedItem = await response.json();
        if (editingGalleryItem) {
          setGallery(gallery.map((item) => (item.id === editingGalleryItem.id ? savedItem : item)));
          toast.success('Gallery item updated');
        } else {
          setGallery([...gallery, savedItem]);
          toast.success('Gallery item added');
        }
        setShowGalleryForm(false);
        setEditingGalleryItem(null);
      } else {
        toast.error('Failed to save gallery item');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDeleteGalleryItem = async (itemId: string) => {
    if (!confirm('Delete this gallery item?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/admin/gallery/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setGallery(gallery.filter((item) => item.id !== itemId));
        toast.success('Gallery item deleted');
      } else {
        toast.error('Failed to delete gallery item');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleSaveWearable = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = getToken();
    const formData = new FormData(e.currentTarget);
    const wearableData = {
      id: editingWearable?.id,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')) || 0,
      image: formData.get('image') as string,
      specs: formData.get('specs') as string,
      available: formData.get('available') === 'on',
    };

    try {
      const response = await fetch(`${API_BASE_URL}/admin/wearables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(wearableData),
      });

      if (response.ok) {
        const savedDevice = await response.json();
        if (editingWearable) {
          setWearables(wearables.map((item) => (item.id === editingWearable.id ? savedDevice : item)));
          toast.success('Wearable updated');
        } else {
          setWearables([...wearables, savedDevice]);
          toast.success('Wearable added');
        }
        setShowWearableForm(false);
        setEditingWearable(null);
      } else {
        toast.error('Failed to save wearable');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDeleteWearable = async (wearableId: string) => {
    if (!confirm('Delete this wearable device?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/admin/wearables/${wearableId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setWearables(wearables.filter((item) => item.id !== wearableId));
        toast.success('Wearable deleted');
      } else {
        toast.error('Failed to delete wearable');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Delete this featured topic?')) return;
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE_URL}/admin/featured-topics/${topicId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setFeaturedTopics(featuredTopics.filter((topic) => topic.id !== topicId));
        toast.success('Featured topic deleted');
      } else {
        toast.error('Failed to delete topic');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleSaveTopic = async (formData: FormData) => {
    const token = getToken();
    const topicPayload = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      body: formData.get('body') as string,
    };

    const url = editingTopic ? `${API_BASE_URL}/admin/featured-topics/${editingTopic.id}` : `${API_BASE_URL}/admin/featured-topics`;
    const method = editingTopic ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(topicPayload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        toast.error(errorBody.error || 'Failed to save topic');
        return;
      }

      const savedTopic = await response.json();
      setFeaturedTopics((prev) => {
        if (editingTopic) {
          return prev.map((topic) => (topic.id === savedTopic.id ? savedTopic : topic));
        }
        return [...prev, savedTopic];
      });
      setShowTopicForm(false);
      setEditingTopic(null);
      toast.success('Featured topic saved successfully');
    } catch (error) {
      toast.error('Network error');
    }
  };

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success(`Data exported as CSV: ${filename}`);
  };

  const exportToXLSX = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`Data exported as XLSX: ${filename}`);
  };

  const exportUsers = () => {
    const usersData = users.map(u => ({
      'ID': u.id,
      'Name': u.name,
      'Email': u.email,
      'Phone': u.phone || 'N/A',
      'Role': u.role,
      'Joined': new Date(u.createdAt).toLocaleDateString(),
      'Last Login': u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never',
    }));
    exportToXLSX(usersData, 'users');
  };

  const getRiskClass = (level: string) => {
    if (level === 'low') return 1;
    if (level === 'medium') return 2;
    return 3;
  };

  const exportRecords = () => {
    const recordsData = records.map(r => ({
      'ID': r.id,
      'User Name': r.user?.name || 'Unknown',
      'User Email': r.user?.email || 'Unknown',
      'Assessment Date': new Date(r.timestamp).toLocaleDateString(),
      'Age': r.vitals?.age || '',
      'Systolic BP': r.vitals?.systolicBP || '',
      'Diastolic BP': r.vitals?.diastolicBP || '',
      'Blood Sugar': r.vitals?.bloodSugar || '',
      'Body Temperature': r.vitals?.bodyTemp || '',
      'Heart Rate': r.vitals?.heartRate || '',
      'Current Symptoms': Array.isArray(r.symptoms) ? r.symptoms.join(', ') : r.symptoms || '',
      'Key Risk Factor': Array.isArray(r.result.factors) ? r.result.factors[0] || '' : '',
      'Risk Level': r.result.level,
      'Risk Score': r.result.score,
      'Class': getRiskClass(r.result.level),
    }));
    exportToXLSX(recordsData, 'assessment_records');
  };

  const exportDoctors = () => {
    const doctorsData = doctors.map(d => ({
      'ID': d.id,
      'Name': d.name,
      'Specialty': d.specialty,
      'Email': d.email,
      'Phone': d.phone,
      'Education': d.education,
      'Experience (years)': d.experience,
      'Languages': d.languages.join(', '),
      'Available': d.available ? 'Yes' : 'No',
      'Rating': d.rating,
      'Reviews': d.reviews,
    }));
    exportToXLSX(doctorsData, 'doctors');
  };

  // Clinic Access Functions
  const handleClinicSearch = async () => {
    if (!clinicSearchQuery.trim()) {
      toast.error('Please enter a search query (email, phone, or ID)');
      return;
    }

    setClinicIsSearching(true);
    const token = getToken();
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/search-patients?query=${encodeURIComponent(clinicSearchQuery)}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const results = await response.json();
        setClinicSearchResults(results);
        setSelectedPatient(null);
        if (results.length === 0) {
          toast.info('No patients found matching your search');
        } else {
          toast.success(`Found ${results.length} patient(s)`);
        }
      } else {
        toast.error('Failed to search patients');
        setClinicSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Network error while searching');
      setClinicSearchResults([]);
    } finally {
      setClinicIsSearching(false);
    }
  };

  const getPatientRecords = (patientId: string) => {
    return records.filter(r => r.userId === patientId);
  };

  const handleCreateClinician = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch(`${API_BASE_URL}/admin/clinicians`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ name: data.get('name'), email: data.get('email'), password: data.get('password'), phone: data.get('phone'), specialty: data.get('specialty'), clinicianType: data.get('clinicianType') }) });
    if (!response.ok) return toast.error((await response.json()).error || 'Unable to create account');
    setClinicians([...clinicians, await response.json()]);
    event.currentTarget.reset();
    toast.success('Clinical account created');
  };

  const renderClinicians = () => <div className="grid lg:grid-cols-2 gap-6"><Card><CardHeader><CardTitle>Create clinician login</CardTitle></CardHeader><CardContent><form onSubmit={handleCreateClinician} className="space-y-3"><Input name="name" placeholder="Full name" required /><Input name="email" type="email" placeholder="Email" required /><Input name="password" type="password" placeholder="Temporary password" required /><Input name="phone" placeholder="Phone" /><Input name="specialty" placeholder="Specialty" /><select name="clinicianType" className="w-full border rounded-lg px-3 py-2"><option value="clinician">Doctor / Nurse / CHEW</option><option value="data_entry">Data Entry Officer</option></select><Button type="submit" className="w-full bg-mamacare-coral hover:bg-mamacare-coral-dark">Create login</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Clinical accounts ({clinicians.length})</CardTitle></CardHeader><CardContent className="space-y-2">{clinicians.map(clinician => <div key={clinician.id} className="p-3 bg-gray-50 rounded-lg"><p className="font-semibold">{clinician.name}</p><p className="text-sm text-gray-500">{clinician.email} · {clinician.role}</p></div>)}</CardContent></Card></div>;

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

      <Card>
        <CardHeader>
          <CardTitle>{t('riskDistributionChart') || 'Risk Distribution Chart'}</CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <ChartContainer
              config={{
                low: { label: t('lowRisk') || 'Low risk', color: '#22c55e' },
                medium: { label: t('mediumRisk') || 'Medium risk', color: '#f59e0b' },
                high: { label: t('highRisk') || 'High risk', color: '#ef4444' },
              }}
              className="h-72"
            >
              <BarChart
                data={[
                  { name: t('lowRisk') || 'Low', low: stats.riskDistribution.low, medium: 0, high: 0 },
                  { name: t('mediumRisk') || 'Medium', low: 0, medium: stats.riskDistribution.medium, high: 0 },
                  { name: t('highRisk') || 'High', low: 0, medium: 0, high: stats.riskDistribution.high },
                ]}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <ChartTooltip />
                <ChartLegend verticalAlign="top" />
                <Bar dataKey="low" name={t('lowRisk') || 'Low'} fill="var(--color-low)" />
                <Bar dataKey="medium" name={t('mediumRisk') || 'Medium'} fill="var(--color-medium)" />
                <Bar dataKey="high" name={t('highRisk') || 'High'} fill="var(--color-high)" />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-gray-500">Loading risk distribution chart...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LSCDM Computational Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Measured assessments</p>
              <p className="font-display text-2xl font-bold">{stats?.computationalPerformance?.measuredAssessments || 0}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Average execution time (Te)</p>
              <p className="font-display text-2xl font-bold">{(stats?.computationalPerformance?.averageExecutionTimeMs || 0).toFixed(3)} ms</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Average memory utilisation (Mu)</p>
              <p className="font-display text-2xl font-bold">{(stats?.computationalPerformance?.averageMemoryUtilizationMb || 0).toFixed(3)} MB</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">CLSCDM = (Te, Mu), measured during LSCDM risk calculation.</p>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('users')} ({users.length})</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={exportUsers}
          >
            <Table2 className="w-4 h-4" /> XLSX
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => {
              const usersData = users.map(u => ({
                'ID': u.id,
                'Name': u.name,
                'Email': u.email,
                'Phone': u.phone || 'N/A',
                'Role': u.role,
                'Joined': new Date(u.createdAt).toLocaleDateString(),
                'Last Login': u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never',
              }));
              exportToCSV(usersData, 'users');
            }}
          >
            <FileJson className="w-4 h-4" /> CSV
          </Button>
        </div>
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
                  {roleLabels[user.role]}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </p>
                {/* Role assignment buttons for admin and superadmin */}
                {isAdmin && user.role !== 'superadmin' && (
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('records')} ({records.length})</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={exportRecords}
          >
            <Table2 className="w-4 h-4" /> XLSX
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => {
              const recordsData = records.map(r => ({
                'ID': r.id,
                'User Name': r.user?.name || 'Unknown',
                'User Email': r.user?.email || 'Unknown',
                'Assessment Date': new Date(r.timestamp).toLocaleDateString(),
                'Age': r.vitals?.age || '',
                'Systolic BP': r.vitals?.systolicBP || '',
                'Diastolic BP': r.vitals?.diastolicBP || '',
                'Blood Sugar': r.vitals?.bloodSugar || '',
                'Body Temperature': r.vitals?.bodyTemp || '',
                'Heart Rate': r.vitals?.heartRate || '',
                'Current Symptoms': Array.isArray(r.symptoms) ? r.symptoms.join(', ') : r.symptoms || '',
                'Key Risk Factor': Array.isArray(r.result.factors) ? r.result.factors[0] || '' : '',
                'Risk Level': r.result.level,
                'Risk Score': r.result.score,
                'Class': getRiskClass(r.result.level),
              }));
              exportToCSV(recordsData, 'assessment_records');
            }}
          >
            <FileJson className="w-4 h-4" /> CSV
          </Button>
        </div>
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={exportDoctors}
          >
            <Table2 className="w-4 h-4" /> XLSX
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => {
              const doctorsData = doctors.map(d => ({
                'ID': d.id,
                'Name': d.name,
                'Specialty': d.specialty,
                'Email': d.email,
                'Phone': d.phone,
                'Education': d.education,
                'Experience (years)': d.experience,
                'Languages': d.languages.join(', '),
                'Available': d.available ? 'Yes' : 'No',
                'Rating': d.rating,
                'Reviews': d.reviews,
              }));
              exportToCSV(doctorsData, 'doctors');
            }}
          >
            <FileJson className="w-4 h-4" /> CSV
          </Button>
          <Button
            onClick={() => { setEditingDoctor(null); setShowDoctorForm(true); }}
            className="bg-mamacare-coral hover:bg-mamacare-coral-dark"
          >
            <Plus className="w-4 h-4 mr-2" /> {t('addDoctor')}
          </Button>
        </div>
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
                <Label>Profile Image</Label>
                <div className="flex items-center gap-2">
                  <Input name="image" defaultValue={editingDoctor?.image} placeholder="Image URL" />
                  <label className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setDoctorImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
                {doctorImageFile && (
                  <p className="text-sm text-gray-600 mt-1">Selected: {doctorImageFile.name}</p>
                )}
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

  const renderContentManagement = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Posts ({posts.length})</CardTitle>
          <Button className="bg-mamacare-coral hover:bg-mamacare-coral-dark" onClick={() => { setEditingPost(null); setShowPostForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Post
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">{post.title}</p>
                <p className="text-sm text-gray-500">{post.excerpt}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditingPost(post); setShowPostForm(true); }}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeletePost(post.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-gray-500 text-center py-6">No posts yet. Use the button above to add content.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Gallery ({gallery.length})</CardTitle>
          <Button className="bg-mamacare-coral hover:bg-mamacare-coral-dark" onClick={() => { setEditingGalleryItem(null); setShowGalleryForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Image
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gallery.map((item) => (
            <div key={item.id} className="rounded-2xl overflow-hidden border border-gray-200">
              <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-500">{item.caption}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditingGalleryItem(item); setShowGalleryForm(true); }}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteGalleryItem(item.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {gallery.length === 0 && <p className="text-gray-500 col-span-full text-center py-6">No gallery items yet.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Wearable Devices ({wearables.length})</CardTitle>
          <Button className="bg-mamacare-coral hover:bg-mamacare-coral-dark" onClick={() => { setEditingWearable(null); setShowWearableForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Device
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {wearables.map((device) => (
            <div key={device.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">{device.name}</p>
                <p className="text-sm text-gray-500">{device.description}</p>
                <p className="text-sm text-gray-500">Price: ₦{device.price.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditingWearable(device); setShowWearableForm(true); }}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteWearable(device.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {wearables.length === 0 && <p className="text-gray-500 text-center py-6">No wearable devices configured yet.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Featured Topics ({featuredTopics.length})</CardTitle>
          <Button className="bg-mamacare-coral hover:bg-mamacare-coral-dark" onClick={() => { setEditingTopic(null); setShowTopicForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Topic
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {featuredTopics.map((topic) => (
            <div key={topic.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">{topic.title}</p>
                <p className="text-sm text-gray-500">{topic.description}</p>
                <p className="text-xs text-gray-400 uppercase mt-1">{topic.category}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditingTopic(topic); setShowTopicForm(true); }}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteTopic(topic.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {featuredTopics.length === 0 && <p className="text-gray-500 text-center py-6">No featured topics yet. Add one to make education content available to users.</p>}
        </CardContent>
      </Card>

      {showPostForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold">{editingPost ? 'Edit Post' : 'Add Post'}</h3>
              <button onClick={() => { setShowPostForm(false); setEditingPost(null); }}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSavePost} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input name="title" defaultValue={editingPost?.title} required />
              </div>
              <div>
                <Label>Excerpt</Label>
                <Input name="excerpt" defaultValue={editingPost?.excerpt} required />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input name="image" defaultValue={editingPost?.image} />
              </div>
              <div>
                <Label>Content</Label>
                <textarea name="content" defaultValue={editingPost?.content} className="w-full px-3 py-2 border rounded-lg" rows={6} required />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowPostForm(false); setEditingPost(null); }}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-mamacare-coral hover:bg-mamacare-coral-dark text-white">
                  Save Post
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGalleryForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold">{editingGalleryItem ? 'Edit Gallery Item' : 'Add Gallery Item'}</h3>
              <button onClick={() => { setShowGalleryForm(false); setEditingGalleryItem(null); }}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSaveGalleryItem} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input name="title" defaultValue={editingGalleryItem?.title} required />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input name="image" defaultValue={editingGalleryItem?.image} required />
              </div>
              <div>
                <Label>Caption</Label>
                <textarea name="caption" defaultValue={editingGalleryItem?.caption} className="w-full px-3 py-2 border rounded-lg" rows={4} />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowGalleryForm(false); setEditingGalleryItem(null); }}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-mamacare-coral hover:bg-mamacare-coral-dark text-white">
                  Save Image
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWearableForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold">{editingWearable ? 'Edit Wearable' : 'Add Wearable'}</h3>
              <button onClick={() => { setShowWearableForm(false); setEditingWearable(null); }}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSaveWearable} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input name="name" defaultValue={editingWearable?.name} required />
              </div>
              <div>
                <Label>Description</Label>
                <Input name="description" defaultValue={editingWearable?.description} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label>
                  <Input name="price" type="number" defaultValue={editingWearable?.price ?? 0} required />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input name="image" defaultValue={editingWearable?.image} />
                </div>
              </div>
              <div>
                <Label>Specs</Label>
                <Input name="specs" defaultValue={editingWearable?.specs} />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="available" defaultChecked={editingWearable?.available ?? true} />
                <span>Available for sale</span>
              </label>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowWearableForm(false); setEditingWearable(null); }}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-mamacare-coral hover:bg-mamacare-coral-dark text-white">
                  Save Wearable
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTopicForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold">{editingTopic ? 'Edit Featured Topic' : 'Add Featured Topic'}</h3>
              <button onClick={() => { setShowTopicForm(false); setEditingTopic(null); }}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); handleSaveTopic(new FormData(event.currentTarget)); }} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input name="title" defaultValue={editingTopic?.title} required />
              </div>
              <div>
                <Label>Description</Label>
                <Input name="description" defaultValue={editingTopic?.description} required />
              </div>
              <div>
                <Label>Category</Label>
                <Input name="category" defaultValue={editingTopic?.category} required />
              </div>
              <div>
                <Label>Body</Label>
                <textarea name="body" defaultValue={editingTopic?.body} className="w-full px-3 py-2 border rounded-lg" rows={6} />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowTopicForm(false); setEditingTopic(null); }}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-mamacare-coral hover:bg-mamacare-coral-dark text-white">
                  Save Topic
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderClinicAccess = () => (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Patient Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Search for patient data by email, phone number, or patient ID. No registration required.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter email, phone, or patient ID..."
              value={clinicSearchQuery}
              onChange={(e) => setClinicSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleClinicSearch();
                }
              }}
              disabled={clinicIsSearching}
              className="flex-1"
            />
            <Button
              onClick={handleClinicSearch}
              disabled={clinicIsSearching || !clinicSearchQuery.trim()}
              className="bg-mamacare-coral hover:bg-mamacare-coral-dark"
            >
              {clinicIsSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {clinicSearchResults.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patients List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Found Patients ({clinicSearchResults.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {clinicSearchResults.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedPatient?.id === patient.id
                        ? 'bg-blue-50 border-blue-400'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <p className="font-medium text-sm">{patient.name}</p>
                    <p className="text-xs text-gray-500">{patient.email}</p>
                    <p className="text-xs text-gray-400">{patient.phone || 'No phone'}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Patient Details */}
          {selectedPatient && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Patient Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedPatient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedPatient.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Patient ID</p>
                      <p className="font-medium text-xs">{selectedPatient.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="font-medium">{new Date(selectedPatient.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Login</p>
                      <p className="font-medium">
                        {selectedPatient.lastLogin 
                          ? new Date(selectedPatient.lastLogin).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assessment History */}
                {getPatientRecords(selectedPatient.id).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">Assessment History</h3>
                    <div className="space-y-2">
                      {getPatientRecords(selectedPatient.id).map((record) => (
                        <div key={record.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {new Date(record.timestamp).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                Score: {record.result.score} | {record.result.alertStatus || 'Routine Monitoring'}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              record.result.level === 'low' ? 'bg-green-100 text-green-700' :
                              record.result.level === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {record.result.level.toUpperCase()}
                            </span>
                          </div>
                          <div className="mt-3 grid md:grid-cols-2 gap-3 text-xs text-gray-600">
                            <div>
                              <p className="font-semibold text-gray-800">Vital drivers</p>
                              {(record.result.vitalContributions || []).length > 0 ? record.result.vitalContributions?.map((item) => (
                                <p key={item.feature}>{item.label}: +{item.contribution} ({item.value})</p>
                              )) : <p>No abnormal vital contribution detected.</p>}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Symptoms correlated with vitals</p>
                              {(record.result.correlations || []).length > 0 ? record.result.correlations?.map((item, index) => (
                                <p key={`${item.symptom}-${item.vital}-${index}`}>{item.symptom} + {item.vitalLabel} ({item.vitalValue} {item.vitalUnit})</p>
                              )) : <p>No correlation recorded.</p>}
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">{record.result.deltaRisk !== null && record.result.deltaRisk !== undefined ? `Risk change: ${record.result.deltaRisk > 0 ? '+' : ''}${record.result.deltaRisk}` : 'Baseline observation'}</p>
                          {(record.result.riskCategories || []).length > 0 && (
                            <div className="mt-3 border-t pt-2 text-xs">
                              <p className="font-semibold text-gray-800">Risk categories</p>
                              {record.result.riskCategories?.map((category) => (
                                <p key={category.name} className="text-gray-600">{category.name}: {category.evidence.join('; ')}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {getPatientRecords(selectedPatient.id).length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No assessment records found for this patient</p>
                  </div>
                )}

                {/* Export Patient Data */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => {
                      const patientData = [{
                        'Name': selectedPatient.name,
                        'Email': selectedPatient.email,
                        'Phone': selectedPatient.phone || 'N/A',
                        'Patient ID': selectedPatient.id,
                        'Registered': new Date(selectedPatient.createdAt).toLocaleDateString(),
                        'Last Login': selectedPatient.lastLogin ? new Date(selectedPatient.lastLogin).toLocaleDateString() : 'Never',
                        'Assessments': getPatientRecords(selectedPatient.id).length,
                      }];
                      exportToCSV(patientData, `patient_${selectedPatient.id}`);
                    }}
                    className="w-full bg-mamacare-coral hover:bg-mamacare-coral-dark text-white flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Patient Data (CSV)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {clinicSearchResults.length === 0 && clinicSearchQuery && !clinicIsSearching && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No patients found. Try searching with a different query.</p>
          </CardContent>
        </Card>
      )}

      {!clinicSearchQuery && clinicSearchResults.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Enter a search query to find patient data</p>
          </CardContent>
        </Card>
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
            { id: 'content', label: t('content'), icon: BookOpen },
            { id: 'clinic', label: 'Clinic Access', icon: Calendar },
            ...(isSuperadmin ? [{ id: 'clinicians', label: 'Clinical Accounts', icon: Users }] : []),
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
        {activeTab === 'content' && renderContentManagement()}
        {activeTab === 'clinic' && renderClinicAccess()}
        {activeTab === 'clinicians' && isSuperadmin && renderClinicians()}
      </div>
    </div>
  );
}
