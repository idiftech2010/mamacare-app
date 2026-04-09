import { useState, useEffect } from 'react';
import { 
  Activity, AlertCircle, CheckCircle2, Info, ArrowRight,
  Heart, Thermometer, Droplets, Clock, User, FileText,
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

interface RiskResultData {
  level: 'low' | 'medium' | 'high';
  score: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mamacare-backend-n1z7.onrender.com/api';

export default function RiskAssessment() {
  const { t } = useLanguage();
  const { isAuthenticated, getToken } = useAuth();
  const [isAssessing, setIsAssessing] = useState(false);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [pastAssessments, setPastAssessments] = useState<RiskResult[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [formData, setFormData] = useState({
    age: '',
    systolicBP: '',
    diastolicBP: '',
    bloodSugar: '',
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

  const assessRisk = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to use the risk assessment');
      return;
    }

    // Validate inputs
    const requiredFields = ['age', 'systolicBP', 'diastolicBP', 'bloodSugar', 'bodyTemp', 'heartRate'];
    const missingFields = requiredFields.filter(f => !formData[f as keyof typeof formData]);
    if (missingFields.length > 0) {
      toast.error('Please fill in all fields');
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
          bodyTemp: parseFloat(formData.bodyTemp),
          heartRate: parseInt(formData.heartRate),
          pregnancyWeek: formData.pregnancyWeek ? parseInt(formData.pregnancyWeek) : undefined,
          symptoms: selectedSymptoms.filter(s => s !== 'None'),
          notes: additionalNotes,
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
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
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
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
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
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 resize-none"
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
