import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Activity, ClipboardList, Download, FileSpreadsheet, Search, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api';
import { downloadAssessmentReport, getPreviousPregnancyOutcomeCode } from '@/lib/assessmentReport';
import { toast } from 'sonner';

type Patient = { id: string; patientId: string; name: string; email: string; phone?: string; assessmentCount: number };
type RecordData = { id: string; userId: string; timestamp: string; pregnancyWeek?: number; notes?: string; vitals?: Record<string, number>; symptoms?: string[]; previousPregnancyOutcomeCode?: number; previousPregnancyHistory?: { outcomes?: string[]; complications?: string[]; previousPregnancyOutcomeCode?: number }; result: { level: string; score: number; confidence?: number; factors?: string[]; recommendations?: string[]; alertStatus?: string } };

const exportData = (rows: Record<string, unknown>[], format: 'csv' | 'xlsx') => {
  if (!rows.length) return toast.error('No data to export');
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Assessments');
  XLSX.writeFile(book, `mamacare_assessments_${new Date().toISOString().slice(0, 10)}.${format}`);
};

export default function ClinicalDashboard() {
  const { getToken, user } = useAuth();
  const { patientId } = useParams();
  const isDataEntry = user?.role === 'data_entry';
  const [tab, setTab] = useState<'overview' | 'patients' | 'records'>('overview');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [records, setRecords] = useState<RecordData[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [patientsResponse, recordsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/clinical/patients`, { headers }),
        fetch(`${API_BASE_URL}/clinical/records`, { headers }),
      ]);
      if (patientsResponse.ok) setPatients(await patientsResponse.json());
      if (recordsResponse.ok) setRecords(await recordsResponse.json());
    };
    load().catch(() => toast.error('Unable to load clinical data'));
  }, [getToken]);

  const patientMap = new Map(patients.map(patient => [patient.id, patient]));
  const filteredPatients = patients.filter(patient => `${patient.patientId} ${patient.name} ${patient.email}`.toLowerCase().includes(query.toLowerCase()));
  const exportRows = records.map(record => ({
    'Patient ID': patientMap.get(record.userId)?.patientId || record.userId,
    'Patient Name': patientMap.get(record.userId)?.name || 'Unknown',
    'Assessment Date': new Date(record.timestamp).toLocaleString(),
    'Age': record.vitals?.age || '',
    'Systolic BP': record.vitals?.systolicBP || '',
    'Diastolic BP': record.vitals?.diastolicBP || '',
    'Blood Sugar': record.vitals?.bloodSugar || '',
    'Body Temperature': record.vitals?.bodyTemp || '',
    'Heart Rate': record.vitals?.heartRate || '',
    Symptoms: record.symptoms?.join(', ') || '',
    'Previous Pregnancy Outcomes': record.previousPregnancyHistory?.outcomes?.join(', ') || '',
    'Previous Pregnancy Complications': record.previousPregnancyHistory?.complications?.join(', ') || '',
    'Previous Pregnancy Outcome Code': record.previousPregnancyOutcomeCode ?? getPreviousPregnancyOutcomeCode(record.previousPregnancyHistory),
    'Risk Level': record.result.level,
    'Risk Score': record.result.score,
  }));

  if (patientId) {
    const patient = patientMap.get(patientId);
    const patientRecords = records.filter(record => record.userId === patientId);
    return <div className="min-h-screen bg-mamacare-cream py-24"><div className="max-w-5xl mx-auto px-4 space-y-6">
      <Link to="/clinical" className="text-sm text-mamacare-coral hover:underline">Back to clinical dashboard</Link>
      <Card><CardHeader><CardTitle>{patient?.name || 'Patient EMR'}</CardTitle><p className="text-mamacare-coral">Patient ID: {patient?.patientId || patientId}</p></CardHeader><CardContent><div className="grid md:grid-cols-3 gap-4 text-sm"><div><p className="text-gray-500">Email</p><p>{patient?.email || 'Not available'}</p></div><div><p className="text-gray-500">Phone</p><p>{patient?.phone || 'Not provided'}</p></div><div><p className="text-gray-500">Assessments</p><p>{patientRecords.length}</p></div></div></CardContent></Card>
      <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>Assessment history</CardTitle>{patientRecords.length > 0 && <Button variant="outline" onClick={() => downloadAssessmentReport(patientRecords, patient?.name || 'Patient')}><Download className="w-4 h-4 mr-2" />PDF history</Button>}</div></CardHeader><CardContent className="space-y-3">{patientRecords.map(record => <div key={record.id} className="p-4 rounded-lg bg-gray-50"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">{new Date(record.timestamp).toLocaleString()}</p><div className="flex items-center gap-3"><span>{record.result.level} ({record.result.score})</span><Button variant="ghost" size="sm" aria-label="Download assessment PDF" onClick={() => downloadAssessmentReport([record], patient?.name || 'Patient')}><Download className="w-4 h-4" /></Button></div></div><p className="text-sm text-gray-600 mt-2">{record.result.factors?.join(', ') || 'No recorded risk factors'}</p><p className="text-sm text-gray-500 mt-2">Symptoms: {record.symptoms?.join(', ') || 'None recorded'}</p><p className="text-sm text-gray-500 mt-2">Previous pregnancy outcome code: {record.previousPregnancyOutcomeCode ?? getPreviousPregnancyOutcomeCode(record.previousPregnancyHistory)}</p></div>)}{!patientRecords.length && <p className="text-gray-500">No assessment history recorded.</p>}</CardContent></Card>
    </div></div>;
  }

  return <div className="min-h-screen bg-mamacare-cream py-24"><div className="max-w-7xl mx-auto px-4 space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm uppercase tracking-widest text-mamacare-coral">Clinical workspace</p><h1 className="font-display text-4xl font-bold">{isDataEntry ? 'Data Entry Dashboard' : 'Clinician Dashboard'}</h1><p className="text-gray-600 mt-2">{isDataEntry ? 'Collect, review, and export anonymized assessment datasets.' : 'Review patient histories and assessment risk signals.'}</p></div>{isDataEntry && <Link to="/assessment"><Button className="bg-mamacare-coral hover:bg-mamacare-coral-dark"><ClipboardList className="w-4 h-4 mr-2" />Open assessment form</Button></Link>}</div>
    <div className="grid md:grid-cols-3 gap-4"><Card><CardContent className="p-5"><Users className="w-7 h-7 text-mamacare-coral mb-3" /><p className="text-gray-500">Patients</p><p className="text-3xl font-bold">{patients.length}</p></CardContent></Card><Card><CardContent className="p-5"><Activity className="w-7 h-7 text-blue-600 mb-3" /><p className="text-gray-500">Assessments</p><p className="text-3xl font-bold">{records.length}</p></CardContent></Card><Card><CardContent className="p-5"><Activity className="w-7 h-7 text-red-600 mb-3" /><p className="text-gray-500">High risk alerts</p><p className="text-3xl font-bold">{records.filter(record => record.result.level === 'high').length}</p></CardContent></Card></div>
    <div className="flex flex-wrap items-center gap-2"><div className="flex flex-wrap gap-2">{(['overview', 'patients', 'records'] as const).map(item => <Button key={item} variant={tab === item ? 'default' : 'outline'} onClick={() => setTab(item)}>{item === 'records' ? 'Patient EMR' : item[0].toUpperCase() + item.slice(1)}</Button>)}</div><div className="ml-auto flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-2"><span className="text-sm font-medium text-gray-600">Download {isDataEntry ? 'my entered records' : 'all records'}:</span><Button variant="outline" size="sm" onClick={() => exportData(exportRows, 'xlsx')}><FileSpreadsheet className="w-4 h-4 mr-2" />XLSX</Button><Button variant="outline" size="sm" onClick={() => exportData(exportRows, 'csv')}><Download className="w-4 h-4 mr-2" />CSV</Button></div></div>
    {(tab === 'overview' || tab === 'patients') && <Card><CardHeader><CardTitle>Patient directory</CardTitle><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input className="pl-9" placeholder="Search patient ID, name, or email" value={query} onChange={event => setQuery(event.target.value)} /></div></CardHeader><CardContent className="space-y-2">{filteredPatients.map(patient => <Link key={patient.id} to={`/clinical/patients/${patient.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg bg-gray-50 hover:bg-blue-50"><div><p className="font-semibold">{patient.name}</p><p className="text-sm text-mamacare-coral">{patient.patientId}</p><p className="text-sm text-gray-500">{patient.email}</p></div><span className="text-sm text-gray-500">{patient.assessmentCount} assessments</span></Link>)}{!filteredPatients.length && <p className="text-gray-500 py-6 text-center">No patients found.</p>}</CardContent></Card>}
    {tab === 'records' && <Card><CardHeader><CardTitle>Patient EMR and assessment history</CardTitle></CardHeader><CardContent className="space-y-3">{records.map(record => { const patient = patientMap.get(record.userId); return <Link key={record.id} to={`/clinical/patients/${record.userId}`} className="block p-4 rounded-lg bg-gray-50 hover:bg-blue-50"><div className="flex justify-between gap-4"><div><p className="font-semibold">{patient?.name || 'Unknown patient'} <span className="text-sm font-normal text-mamacare-coral">{patient?.patientId || record.userId}</span></p><p className="text-sm text-gray-500">{new Date(record.timestamp).toLocaleString()}</p></div><span className="text-sm font-semibold">{record.result.level} ({record.result.score})</span></div><p className="text-sm text-gray-600 mt-2">{record.result.factors?.join(', ') || 'No recorded risk factors'}</p></Link>})}</CardContent></Card>}
  </div></div>;
}
