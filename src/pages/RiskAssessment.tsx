import { useState, useEffect } from 'react';
import { 
  Activity, AlertCircle, CheckCircle2, Info, ArrowRight,
  Heart, Thermometer, Droplets, Clock, User, FileText, X,
  TrendingUp, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartLegend } from '@/components/ui/chart';
import { LineChart, CartesianGrid, XAxis, YAxis, Line } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';

interface RiskResultData {
  level: 'low' | 'medium' | 'high';
  score: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
  vitalContributions?: Array<{ feature: string; label: string; contribution: number; reason: string; value: number; unit: string }>;
  symptomContributions?: Array<{ symptom: string; contribution: number; reason: string }>;
  correlations?: Array<{ symptom: string; vital: string; vitalLabel: string; vitalValue: number; vitalUnit: string; relationship: string; strength: string }>;
  historyCorrelations?: Array<{ history: string; historyLabel: string; vital: string; vitalLabel: string; vitalValue: number; vitalUnit: string; relationship: string; strength: string }>;
  previousRisk?: number | null;
  deltaRisk?: number | null;
  alertStatus?: string;
  riskCategories?: Array<{ name: string; status: string; evidence: string[]; note?: string }>;
  historyContributions?: Array<{ feature: string; label: string; contribution: number; reason: string }>;
  protectiveFactors?: string[];
  previousPregnancyHistory?: PreviousPregnancyHistory;
  currentSymptoms?: string[];
  modelVersion?: string;
  expandedFeatureSetUsed?: boolean;
  shapAvailable?: boolean;
  riskProbabilities?: { low: number; medium: number; high: number };
  urgentSymptoms?: string[];
}

interface PreviousPregnancyHistory {
  gravida: number | null;
  para: number | null;
  liveBirths: number | null;
  pregnancyLosses: number | null;
  previousCesareanSections: number | null;
  previousMultiplePregnancy: boolean | null;
  outcomes: string[];
  deliveryMethods: string[];
  complications: string[];
  unknown: boolean;
}

interface RiskResult {
  id?: string;
  result: RiskResultData;
  pregnancyWeek?: number;
  symptoms?: string[];
  notes?: string;
  timestamp: string;
  userId?: string;
  vitals?: {
    age: number;
    systolicBP: number;
    diastolicBP: number;
    bloodSugar: number;
    bodyTemp: number;
    heartRate: number;
  };
  previousPregnancyHistory?: PreviousPregnancyHistory;
}

const symptomsList = [
  'Headache',
  'Dizziness',
  'Blurred Vision',
  'Abdominal Pain',
  'Vaginal Bleeding',
  'Severe Swelling',
  'Reduced Fetal Movement',
  'Fever',
  'Nausea/Vomiting',
  'Difficulty Breathing',
  'None'
];

const historyGroups = [
  { key: 'outcomes', label: 'Previous Pregnancy Outcome', options: ['No previous pregnancy', 'Previous pregnancy with no reported complication', 'Live birth', 'Stillbirth', 'Neonatal death', 'Miscarriage', 'Recurrent miscarriage', 'Termination of pregnancy', 'Termination for medical or fetal reason', 'Ectopic pregnancy', 'Molar pregnancy', 'Pregnancy loss, outcome unspecified'] },
  { key: 'deliveryMethods', label: 'Previous Delivery Method', options: ['No previous delivery', 'Spontaneous vaginal delivery', 'Assisted vaginal delivery', 'Caesarean section', 'Emergency Caesarean section', 'Elective Caesarean section', 'Instrumental delivery', 'Delivery method unknown'] },
  { key: 'complications', label: 'Previous Pregnancy Complications', options: ['pre-eclampsia', 'gestational hypertension', 'eclampsia', 'gestational diabetes', 'postpartum haemorrhage', 'antepartum haemorrhage', 'preterm birth', 'premature rupture of membranes', 'fetal growth restriction', 'small-for-gestational-age baby', 'placental abruption', 'placenta previa', 'anaemia in pregnancy', 'maternal infection', 'obstructed labour', 'prolonged labour', 'birth trauma', 'ICU admission during pregnancy or childbirth', 'maternal near-miss event', 'blood transfusion', 'uterine surgery', 'pregnancy complication, other', 'No known previous complication', 'Unknown previous pregnancy history'] },
  { key: 'history', label: 'Previous Pregnancy History', options: ['Gravida', 'Para', 'Number of previous live births', 'Number of previous pregnancy losses', 'Number of previous Caesarean sections', 'Previous multiple pregnancy', 'Previous pregnancy with multiple births', 'Previous pregnancy outcome unknown'] },
] as const;

const initialHistory: PreviousPregnancyHistory = { gravida: null, para: null, liveBirths: null, pregnancyLosses: null, previousCesareanSections: null, previousMultiplePregnancy: null, outcomes: [], deliveryMethods: [], complications: [], unknown: false };

export default function RiskAssessment() {
  const { t } = useLanguage();
  const { isAuthenticated, getToken, user } = useAuth();
  const canEnterPreviousHistory = ['clinician', 'data_entry', 'admin', 'superadmin'].includes(user?.role);
  const patientHistoryGroups = historyGroups.map(group => group.key === 'history'
    ? { ...group, options: group.options.filter(option => !['Gravida', 'Para', 'Number of previous live births', 'Number of previous pregnancy losses', 'Number of previous Caesarean sections'].includes(option)) }
    : group).filter(group => group.key === 'history');
  const [isAssessing, setIsAssessing] = useState(false);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [pastAssessments, setPastAssessments] = useState<RiskResult[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [previousPregnancyHistory, setPreviousPregnancyHistory] = useState<PreviousPregnancyHistory>(initialHistory);
  const [selectedHistoryFields, setSelectedHistoryFields] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [patients, setPatients] = useState<Array<{ id: string; patientId: string; name: string }>>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [formData, setFormData] = useState({
    age: '',
    systolicBP: '',
    diastolicBP: '',
    bloodSugar: '',
    bloodSugarUnit: 'mmol/L',
    bodyTemp: '',
    heartRate: '',
    pregnancyWeek: '',
  });

  // Fetch past assessments on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchPastAssessments();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user?.role !== 'data_entry') return;
    fetch(`${API_BASE_URL}/clinical/patients`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(response => response.ok ? response.json() : [])
      .then(setPatients)
      .catch(() => toast.error('Unable to load patients'));
  }, [user?.role, getToken]);

  const fetchPastAssessments = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/risk-assessment/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPastAssessments(data);
      }
    } catch (error) {
      console.error('Error fetching past assessments:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (riskResult) setRiskResult(null);
  };

  const toggleSymptom = (symptom: string) => {
    if (symptom === 'None') {
      setSelectedSymptoms(['None']);
    } else {
      setSelectedSymptoms(prev => {
        const withoutNone = prev.filter(s => s !== 'None');
        if (withoutNone.includes(symptom)) {
          return withoutNone.filter(s => s !== symptom);
        } else {
          return [...withoutNone, symptom];
        }
      });
    }
  };

  const updateHistoryCount = (field: keyof Pick<PreviousPregnancyHistory, 'gravida' | 'para' | 'liveBirths' | 'pregnancyLosses' | 'previousCesareanSections'>, value: string) => {
    setPreviousPregnancyHistory(prev => ({ ...prev, [field]: value === '' ? null : Number(value) }));
  };

  const getHistoryValues = (groupKey: string) => groupKey === 'history' ? selectedHistoryFields : previousPregnancyHistory[groupKey as 'outcomes' | 'deliveryMethods' | 'complications'];

  const addHistoryValue = (groupKey: string, option: string) => {
    if (!option) return;
    if (option === 'None') {
      if (groupKey === 'history') setSelectedHistoryFields([]);
      else setPreviousPregnancyHistory(prev => ({ ...prev, [groupKey]: [] }));
      return;
    }
    if (groupKey === 'history') {
      setSelectedHistoryFields(prev => prev.includes(option) ? prev : [...prev, option]);
      if (option === 'Previous multiple pregnancy' || option === 'Previous pregnancy with multiple births') {
        setPreviousPregnancyHistory(prev => ({ ...prev, previousMultiplePregnancy: true }));
      } else if (option === 'Previous pregnancy outcome unknown') {
        setPreviousPregnancyHistory(prev => ({ ...prev, unknown: true, outcomes: ['Previous pregnancy outcome unknown'] }));
      }
      return;
    }
    if (groupKey === 'outcomes' && option === 'No previous pregnancy') {
      setPreviousPregnancyHistory({ ...initialHistory, outcomes: [option] });
      return;
    }
    if (option === 'Unknown previous pregnancy history' || option === 'Previous pregnancy outcome unknown') {
      setPreviousPregnancyHistory({ ...initialHistory, unknown: true, complications: option === 'Unknown previous pregnancy history' ? [option] : [], outcomes: option === 'Previous pregnancy outcome unknown' ? [option] : [] });
      return;
    }
    setPreviousPregnancyHistory(prev => ({ ...prev, unknown: false, [groupKey]: prev[groupKey as 'outcomes' | 'deliveryMethods' | 'complications'].includes(option) ? prev[groupKey as 'outcomes' | 'deliveryMethods' | 'complications'] : [...prev[groupKey as 'outcomes' | 'deliveryMethods' | 'complications'], option] }));
  };

  const removeHistoryValue = (groupKey: string, option: string) => {
    if (groupKey === 'history') {
      setSelectedHistoryFields(prev => prev.filter(value => value !== option));
      if (option === 'Previous multiple pregnancy' || option === 'Previous pregnancy with multiple births') {
        setPreviousPregnancyHistory(prev => ({ ...prev, previousMultiplePregnancy: null }));
      } else if (option === 'Previous pregnancy outcome unknown') {
        setPreviousPregnancyHistory(prev => ({ ...prev, unknown: false, outcomes: prev.outcomes.filter(value => value !== option) }));
      }
    } else {
      setPreviousPregnancyHistory(prev => ({ ...prev, [groupKey]: prev[groupKey as 'outcomes' | 'deliveryMethods' | 'complications'].filter(value => value !== option) }));
    }
  };

  const assessRisk = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to use the risk assessment');
      return;
    }
    if (user?.role === 'data_entry' && !selectedPatientId) {
      toast.error('Select a patient before recording an assessment');
      return;
    }

    // Validate inputs
    const requiredFields = ['age', 'systolicBP', 'diastolicBP', 'bloodSugar', 'bodyTemp', 'heartRate'];
    const missingFields = requiredFields.filter(f => !formData[f as keyof typeof formData]);
    if (missingFields.length > 0) {
      toast.error('Please fill in all fields');
      return;
    }
    const temperature = parseFloat(formData.bodyTemp);
    if (temperature > 43 || temperature < 34) {
      toast.error('Invalid data: Out of physiological range');
      return;
    }
    if (previousPregnancyHistory.gravida !== null && previousPregnancyHistory.para !== null && previousPregnancyHistory.para > previousPregnancyHistory.gravida) {
      toast.error('Para cannot exceed Gravida');
      return;
    }

    setIsAssessing(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/risk-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          age: parseInt(formData.age),
          systolicBP: parseInt(formData.systolicBP),
          diastolicBP: parseInt(formData.diastolicBP),
          bloodSugar: parseFloat(formData.bloodSugar),
          bloodSugarUnit: formData.bloodSugarUnit,
          bodyTemp: parseFloat(formData.bodyTemp),
          heartRate: parseInt(formData.heartRate),
          pregnancyWeek: formData.pregnancyWeek ? parseInt(formData.pregnancyWeek) : undefined,
          patientId: selectedPatientId || undefined,
          symptoms: selectedSymptoms.filter(s => s !== 'None'),
          notes: additionalNotes,
          previousPregnancyHistory,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setRiskResult(result);
        toast.success('Assessment completed successfully!');
        // Refresh past assessments
        fetchPastAssessments();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Assessment failed');
      }
    } catch (error) {
      toast.error('Network error. Please ensure the backend server is running.');
      console.error('Assessment error:', error);
    } finally {
      setIsAssessing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return '';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle2 className="w-12 h-12 text-green-600" />;
      case 'medium': return <AlertCircle className="w-12 h-12 text-amber-600" />;
      case 'high': return <Info className="w-12 h-12 text-red-600" />;
      default: return null;
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'low': return t('lowRisk');
      case 'medium': return t('mediumRisk');
      case 'high': return t('highRisk');
      default: return level;
    }
  };

  const getHealthScore = (riskScore: number) => {
    const score = 100 - riskScore;
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const latestAssessment = pastAssessments[0] || riskResult || null;
  const latestHealthScore = latestAssessment ? getHealthScore(latestAssessment.result.score) : null;
  const pregnancyWeekValue = latestAssessment?.pregnancyWeek;
  const pregnancyProgress = pregnancyWeekValue
    ? Math.min(100, Math.max(0, (pregnancyWeekValue / 40) * 100))
    : 0;
  const weeksLeft = pregnancyWeekValue ? Math.max(0, 40 - pregnancyWeekValue) : 36;

  const assessmentTrendData = pastAssessments
    .slice(0, 8)
    .reverse()
    .map((assessment, index) => ({
      name: assessment.pregnancyWeek ? `W${assessment.pregnancyWeek}` : `Rec ${index + 1}`,
      score: assessment.result.score,
      level: assessment.result.level,
    }));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 bg-mamacare-dark-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t('checkRisk')}
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {t('assessmentSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Assessment Form */}
      <section className="py-16 bg-mamacare-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <Card className="glassmorphism-dark bg-mamacare-dark-grey/90 border-none">
              <CardContent className="p-8">
                <h2 className="font-display text-2xl font-bold text-white mb-6">Enter Your Vitals</h2>
                {user?.role === 'data_entry' && (
                  <div className="mb-6 space-y-2">
                    <Label className="text-white">Patient</Label>
                    <select value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)} className="w-full rounded-md border border-white/20 bg-white px-3 py-2 text-gray-900" required>
                      <option value="" className="text-black">Select a registered patient</option>
                      {patients.map(patient => <option key={patient.id} value={patient.id} className="text-black">{patient.patientId} - {patient.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <User className="w-4 h-4" /> {t('age')}
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 28"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="bg-white border-white/20 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Weeks Pregnant
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 4"
                      value={formData.pregnancyWeek}
                      onChange={(e) => handleInputChange('pregnancyWeek', e.target.value)}
                      className="bg-white border-white/20 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Heart className="w-4 h-4" /> {t('systolicBP')}
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 120"
                      value={formData.systolicBP}
                      onChange={(e) => handleInputChange('systolicBP', e.target.value)}
                      className="bg-white border-white/20 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Heart className="w-4 h-4" /> {t('diastolicBP')}
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 80"
                      value={formData.diastolicBP}
                      onChange={(e) => handleInputChange('diastolicBP', e.target.value)}
                      className="bg-white border-white/20 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Droplets className="w-4 h-4" /> {t('bloodSugar')}
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 7.0"
                      value={formData.bloodSugar}
                      onChange={(e) => handleInputChange('bloodSugar', e.target.value)}
                      className="bg-white border-white/20 text-gray-900 placeholder:text-gray-500"
                    />
                    <select value={formData.bloodSugarUnit} onChange={(e) => handleInputChange('bloodSugarUnit', e.target.value)} className="w-full rounded-md border border-white/20 bg-white px-3 py-2 text-gray-900">
                      <option value="mmol/L" className="text-black">mmol/L</option>
                      <option value="mg/dL" className="text-black">mg/dL</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Thermometer className="w-4 h-4" /> {t('bodyTemp')}
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 37.0"
                      value={formData.bodyTemp}
                      onChange={(e) => handleInputChange('bodyTemp', e.target.value)}
                      className="bg-white border-white/20 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {t('heartRate')}
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 75"
                      value={formData.heartRate}
                      onChange={(e) => handleInputChange('heartRate', e.target.value)}
                      className="bg-white border-white/20 text-gray-900 placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Previous Pregnancy History */}
                <div className="mt-8 border-t border-white/10 pt-6">
                  <Label className="text-white text-lg">Previous Pregnancy Outcomes and Complications</Label>
                  <p className="text-white/60 text-sm mt-2 mb-4">Previous pregnancy outcomes and complications may help identify patterns of maternal risk. Select all that apply. This information supports risk assessment and does not replace professional medical evaluation.</p>
                  <div className="space-y-4">
                    {(canEnterPreviousHistory ? historyGroups : patientHistoryGroups).map(group => {
                      const selectedValues = getHistoryValues(group.key);
                      return <div key={group.key} className="space-y-2">
                        <Label className="text-white/90">{group.label}</Label>
                        <select value="" onChange={(event) => addHistoryValue(group.key, event.target.value)} className="w-full rounded-md border border-white/20 bg-white px-3 py-2 text-gray-900">
                          <option value="" className="text-black">Select an option...</option>
                          <option value="None" className="text-black">None</option>
                          {group.options.map(option => <option key={option} value={option} className="text-black">{option}</option>)}
                        </select>
                        {selectedValues.length > 0 && <div className="flex flex-wrap gap-2">{selectedValues.map(option => <span key={option} className="inline-flex items-center gap-1 rounded-full bg-mamacare-coral px-3 py-1 text-xs text-white">{option}<button type="button" aria-label={`Remove ${option}`} onClick={() => removeHistoryValue(group.key, option)}><X className="h-3 w-3" /></button></span>)}</div>}
                      </div>;
                    })}
                  </div>
                  {canEnterPreviousHistory && <div className="mt-6 border-t border-white/10 pt-4">
                    <Label className="text-white/90">Previous Pregnancy History Details</Label>
                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                      {([['gravida', 'Gravida'], ['para', 'Para'], ['liveBirths', 'Number of previous live births'], ['pregnancyLosses', 'Number of previous pregnancy losses'], ['previousCesareanSections', 'Number of previous Caesarean sections']] as const).map(([field, label]) => (
                        <div key={field} className="space-y-1"><Label className="text-white/80 text-xs">{label}</Label><Input type="number" min="0" value={previousPregnancyHistory[field] ?? ''} onChange={(event) => updateHistoryCount(field, event.target.value)} className="bg-white border-white/20 text-gray-900 placeholder:text-gray-500" /></div>
                      ))}
                    </div>
                    {selectedHistoryFields.some(value => value === 'Previous multiple pregnancy' || value === 'Previous pregnancy with multiple births') && <label className="flex items-center gap-2 text-sm text-white/80 mt-4"><input type="checkbox" checked={previousPregnancyHistory.previousMultiplePregnancy === true} onChange={(event) => setPreviousPregnancyHistory(prev => ({ ...prev, previousMultiplePregnancy: event.target.checked }))} /> Previous multiple pregnancy</label>}
                  </div>}
                </div>

                {/* Current Symptoms */}
                <div className="mt-8">
                  <Label className="text-white flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4" /> {t('currentSymptoms') || 'Current Symptoms'}
                  </Label>
                  <p className="text-white/60 text-sm mb-3">{t('selectSymptoms') || 'Select any symptoms you are currently experiencing'}</p>
                  <div className="flex flex-wrap gap-2">
                    {symptomsList.map((symptom) => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedSymptoms.includes(symptom)
                            ? 'bg-mamacare-coral text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mt-6">
                  <Label className="text-white flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" /> {t('additionalNotes') || 'Additional Notes'}
                  </Label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Add any additional information about your condition..."
                    className="w-full px-4 py-3 bg-white border border-white/20 rounded-lg text-gray-900 placeholder:text-gray-500 resize-none"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={assessRisk}
                  disabled={isAssessing}
                  className="w-full mt-8 bg-mamacare-coral hover:bg-mamacare-coral-dark text-white py-6 text-lg rounded-xl"
                >
                  {isAssessing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('analyzing')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      {t('getAssessment')}
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {riskResult ? (
                <Card className={`border-2 ${getRiskColor(riskResult.result.level)}`}>
                  <CardContent className="p-8">
                    {(riskResult.result.urgentSymptoms || []).length > 0 && <div className="mb-6 rounded-lg border-2 border-red-300 bg-red-100 p-4 text-red-900"><p className="font-bold">Seek immediate professional medical care</p><p className="text-sm mt-1">Urgent symptom(s) selected: {riskResult.result.urgentSymptoms?.join(', ')}. This warning applies regardless of the screening score.</p></div>}
                    <div className="flex items-center gap-4 mb-6">
                      {getRiskIcon(riskResult.result.level)}
                      <div>
                        <p className="text-sm opacity-70">{t('riskAssessmentResult')}</p>
                        <p className={`font-display text-4xl font-bold ${
                          riskResult.result.level === 'low' ? 'text-green-600' :
                          riskResult.result.level === 'medium' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {getRiskLevelText(riskResult.result.level)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-sm opacity-70 mb-2">{t('confidenceScore')}</p>
                        <Progress value={riskResult.result.confidence} className="h-3" />
                        <p className="text-right text-sm mt-1">{riskResult.result.confidence.toFixed(1)}%</p>
                      </div>

                      <div>
                        <p className="text-sm opacity-70 mb-2">{t('keyFactors')}</p>
                        <div className="space-y-2">
                          {riskResult.result.factors.map((factor, idx) => (
                            <p key={idx} className="text-sm p-2 bg-white/50 rounded">{factor}</p>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 p-4">
                        <p className="text-sm font-semibold mb-2">Previous Pregnancy History Considered</p>
                        {riskResult.previousPregnancyHistory && (riskResult.previousPregnancyHistory.outcomes.length + riskResult.previousPregnancyHistory.deliveryMethods.length + riskResult.previousPregnancyHistory.complications.length > 0 || riskResult.previousPregnancyHistory.unknown) ? <p className="text-sm text-gray-700">{[...riskResult.previousPregnancyHistory.outcomes, ...riskResult.previousPregnancyHistory.deliveryMethods, ...riskResult.previousPregnancyHistory.complications].join(', ') || 'Unknown previous pregnancy history'}</p> : <p className="text-sm text-gray-500">No previous pregnancy history recorded.</p>}
                      </div>

                      <div className="rounded-lg border border-slate-200 p-4">
                        <p className="text-sm font-semibold mb-3">Factors Contributing to This Assessment</p>
                        <p className="text-xs font-semibold uppercase text-gray-500">Current vital signs</p>
                        {(riskResult.result.vitalContributions || []).filter(item => item.contribution > 0).map(item => <p key={item.feature} className="text-sm mt-1">{item.label}: +{item.contribution}</p>)}
                        <p className="text-xs font-semibold uppercase text-gray-500 mt-3">Previous pregnancy history</p>
                        {(riskResult.result.historyContributions || []).map(item => <p key={item.feature} className="text-sm mt-1">{item.label}: +{item.contribution}</p>)}
                        <p className="text-xs font-semibold uppercase text-gray-500 mt-3">Current symptoms</p>
                        {(riskResult.result.symptomContributions || []).filter(item => item.contribution > 0).map(item => <p key={item.symptom} className="text-sm mt-1">{item.symptom}: +{item.contribution}</p>)}
                        <p className="text-xs text-gray-500 mt-3">These are screening contributions from the active rule engine, not medical certainty or causal proof.</p>
                      </div>

                      <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                        <p className="text-sm font-semibold mb-2">Risk categories indicated by this assessment</p>
                        {(riskResult.result.riskCategories || []).length > 0 ? riskResult.result.riskCategories?.map((category) => (
                          <div key={category.name} className="mb-3 last:mb-0">
                            <p className="text-sm font-semibold text-red-800">{category.name} <span className="font-normal">| {category.status}</span></p>
                            {category.evidence.map((evidence) => <p key={evidence} className="text-sm text-gray-700">{evidence}</p>)}
                            {category.note && <p className="text-xs text-gray-500 mt-1">{category.note}</p>}
                          </div>
                        )) : <p className="text-sm text-gray-500">No specific risk category indicated by the recorded thresholds.</p>}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="rounded-lg bg-white/50 p-4">
                          <p className="text-sm font-semibold mb-2">Vital drivers</p>
                          {(riskResult.result.vitalContributions || []).length > 0 ? riskResult.result.vitalContributions?.map((item) => (
                            <p key={item.feature} className="text-sm mb-1">{item.label}: +{item.contribution} ({item.value} {item.unit})</p>
                          )) : <p className="text-sm text-gray-500">No abnormal vital contribution detected.</p>}
                        </div>
                        <div className="rounded-lg bg-white/50 p-4">
                          <p className="text-sm font-semibold mb-2">Symptoms and vitals</p>
                          {(riskResult.result.correlations || []).length > 0 ? riskResult.result.correlations?.map((item, index) => (
                            <p key={`${item.symptom}-${item.vital}-${index}`} className="text-sm mb-1">{item.symptom} + {item.vitalLabel} ({item.vitalValue} {item.vitalUnit}): {item.relationship}</p>
                          )) : <p className="text-sm text-gray-500">No symptom-vital correlation recorded.</p>}
                        </div>
                        {canEnterPreviousHistory && <div className="rounded-lg bg-white/50 p-4">
                          <p className="text-sm font-semibold mb-2">Previous history, vitals and symptoms</p>
                          {(riskResult.result.historyCorrelations || []).length > 0 ? riskResult.result.historyCorrelations?.map((item, index) => (
                            <p key={`${item.history}-${item.vital}-${index}`} className="text-sm mb-1">{item.historyLabel} + {item.vitalLabel} ({item.vitalValue} {item.vitalUnit}): {item.relationship}</p>
                          )) : <p className="text-sm text-gray-500">No previous-history and vital correlation recorded.</p>}
                          {(riskResult.result.correlations || []).length > 0 && <p className="text-xs text-gray-500 mt-2">Current symptom correlations are shown alongside this history review.</p>}
                        </div>}
                      </div>
                      <div className="rounded-lg border border-slate-200 p-4">
                        <p className="text-sm font-semibold">Clinical monitoring</p>
                        <p className="text-sm mt-1">{riskResult.result.alertStatus || 'Routine Monitoring'}{riskResult.result.deltaRisk !== null && riskResult.result.deltaRisk !== undefined ? ` | Risk change: ${riskResult.result.deltaRisk > 0 ? '+' : ''}${riskResult.result.deltaRisk}` : ' | Baseline observation'}</p>
                      </div>

                      <div>
                        <p className="text-sm opacity-70 mb-2">{t('recommendations')}</p>
                        <ul className="space-y-2">
                          {riskResult.result.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white border-none shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Activity className="w-16 h-16 text-mamacare-coral mx-auto mb-4" />
                    <p className="text-lg text-gray-600">
                      Enter your vitals and click &quot;Get Assessment&quot; to see your risk level
                    </p>
                    <div className="mt-6 p-4 bg-mamacare-champagne/30 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Normal Ranges:</strong><br />
                        Blood Pressure: 90-120/60-80 mmHg<br />
                        Blood Sugar: 4-7 mmol/L<br />
                        Heart Rate: 60-100 bpm<br />
                        Temperature: 36.5-37.5°C
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-white border-none shadow-lg">
                <CardContent className="p-6 space-y-6">
                  <div className="rounded-3xl bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-300 p-6 text-white overflow-hidden shadow-lg">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-white/80">Pregnancy Journey</p>
                        <h2 className="mt-3 text-3xl font-bold">
                          {pregnancyWeekValue ? `Week ${pregnancyWeekValue}` : 'Track your pregnancy progress'}
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-white/90">
                          {pregnancyWeekValue
                            ? `${weeksLeft} weeks until your expected due date.`
                            : 'Add your pregnancy week above to see personalized journey insights and progress.'}
                        </p>
                      </div>
                      <div className="rounded-full bg-white/10 px-4 py-3 text-sm font-semibold">
                        {pregnancyWeekValue ? `${pregnancyProgress.toFixed(0)}% complete` : 'Awaiting week data'}
                      </div>
                    </div>

                    <div className="mt-6 rounded-full bg-white/20 p-1">
                      <div className="h-3 rounded-full bg-white/90 transition-all" style={{ width: `${pregnancyProgress}%` }} />
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-4">
                    <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                      <p className="text-sm text-gray-500">Latest Health Check</p>
                      <p className="mt-3 text-2xl font-semibold text-gray-900">
                        {latestAssessment ? `${latestHealthScore} pts` : '--'}
                      </p>
                      <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        latestAssessment?.result.level === 'low' ? 'bg-emerald-100 text-emerald-800' :
                        latestAssessment?.result.level === 'medium' ? 'bg-amber-100 text-amber-800' :
                        latestAssessment?.result.level === 'high' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {latestAssessment ? getRiskLevelText(latestAssessment.result.level) : 'No assessment yet'}
                      </span>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                      <p className="text-sm text-gray-500">Health Score</p>
                      <p className="mt-3 text-2xl font-semibold text-gray-900">
                        {latestAssessment ? `${latestHealthScore} / 100` : '--'}
                      </p>
                      <p className="mt-3 text-sm text-gray-500">Higher score means lower risk and healthier vitals.</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                      <p className="text-sm text-gray-500">Pregnancy Week</p>
                      <p className="mt-3 text-2xl font-semibold text-gray-900">
                        {pregnancyWeekValue ? `Week ${pregnancyWeekValue}` : '--'}
                      </p>
                      <p className="mt-3 text-sm text-gray-500">
                        {pregnancyWeekValue ? `${weeksLeft} weeks remaining` : 'Add your week above to begin.'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-gray-900">
                        <TrendingUp className="w-5 h-5 text-mamacare-coral" />
                        <p className="font-semibold">Risk Score Trend</p>
                      </div>
                      <p className="text-sm text-gray-500">{pastAssessments.length} records</p>
                    </div>

                    {assessmentTrendData.length > 0 ? (
                      <ChartContainer
                        config={{ score: { label: 'Risk Score', color: '#ec4899' } }}
                        className="h-64"
                      >
                        <LineChart data={assessmentTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                          <ChartTooltip />
                          <ChartLegend verticalAlign="top" />
                          <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ChartContainer>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-gray-200 p-10 text-center text-gray-500">
                        No history yet. Complete assessments to see progress and retrogression.
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 max-h-48 overflow-auto">
                    {pastAssessments.slice(0, 5).map((assessment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">
                              {new Date(assessment.timestamp).toLocaleDateString()}
                            </p>
                            {assessment.pregnancyWeek && (
                              <p className="text-xs text-gray-400">Week {assessment.pregnancyWeek}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">Score: {assessment.result.score}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            assessment.result.level === 'low' ? 'bg-green-100 text-green-700' :
                            assessment.result.level === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {getRiskLevelText(assessment.result.level)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
