import { jsPDF } from 'jspdf';

export interface AssessmentReportRecord {
  id?: string;
  timestamp: string;
  pregnancyWeek?: number;
  symptoms?: string[];
  notes?: string;
  vitals?: Record<string, number>;
  previousPregnancyOutcomeCode?: number;
  previousPregnancyHistory?: {
    gravida?: number | null;
    para?: number | null;
    liveBirths?: number | null;
    pregnancyLosses?: number | null;
    previousCesareanSections?: number | null;
    previousMultiplePregnancy?: boolean | null;
    outcomes?: string[];
    deliveryMethods?: string[];
    complications?: string[];
    unknown?: boolean;
    previousPregnancyOutcomeCode?: number;
  };
  result: {
    level: string;
    score: number;
    confidence?: number;
    factors?: string[];
    recommendations?: string[];
    alertStatus?: string;
  };
}

const valueOrNone = (value: unknown) => value === undefined || value === null || value === '' ? 'None recorded' : String(value);

export function getPreviousPregnancyOutcomeCode(history: AssessmentReportRecord['previousPregnancyHistory']) {
  if (!history) return 0;
  if (history.previousPregnancyOutcomeCode !== undefined) return history.previousPregnancyOutcomeCode;
  if (history.unknown || history.outcomes?.includes('Previous pregnancy outcome unknown')) return 3;
  if (history.outcomes?.includes('Previous pregnancy with multiple births')) return 2;
  if (history.previousMultiplePregnancy === true || history.outcomes?.includes('Previous multiple pregnancy')) return 1;
  return 0;
}

export function downloadAssessmentReport(records: AssessmentReportRecord[], patientName = 'Patient') {
  if (!records.length) return;
  const document = new jsPDF();
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  let y = 18;

  const addText = (text: string, options: { bold?: boolean; size?: number } = {}) => {
    const size = options.size || 10;
    document.setFont('helvetica', options.bold ? 'bold' : 'normal');
    document.setFontSize(size);
    const lines = document.splitTextToSize(text, pageWidth - 28) as string[];
    const lineHeight = size * 0.48 + 2;
    if (y + lines.length * lineHeight > pageHeight - 16) {
      document.addPage();
      y = 18;
    }
    document.text(lines, 14, y);
    y += lines.length * lineHeight + 3;
  };

  addText('MamaCare Pregnancy Risk Assessment Report', { bold: true, size: 16 });
  addText(`Patient: ${patientName}`, { bold: true });
  addText(`Generated: ${new Date().toLocaleString()}`);
  addText(`${records.length === 1 ? 'Individual assessment' : `Combined report of ${records.length} assessments`}`, { bold: true });

  records.slice().sort((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()).forEach((record, index) => {
    y += 3;
    addText(`Assessment ${index + 1}: ${new Date(record.timestamp).toLocaleString()}`, { bold: true, size: 12 });
    addText(`Risk: ${record.result.level.toUpperCase()} | Score: ${record.result.score} | Confidence: ${valueOrNone(record.result.confidence)}${record.pregnancyWeek ? ` | Pregnancy week: ${record.pregnancyWeek}` : ''}`);
    const vitals = record.vitals || {};
    addText(`Vitals: Age ${valueOrNone(vitals.age)}, BP ${valueOrNone(vitals.systolicBP)}/${valueOrNone(vitals.diastolicBP)} mmHg, Blood sugar ${valueOrNone(vitals.bloodSugar)}, Temperature ${valueOrNone(vitals.bodyTemp)} C, Heart rate ${valueOrNone(vitals.heartRate)} bpm`);
    const history = record.previousPregnancyHistory;
    const historyCode = record.previousPregnancyOutcomeCode ?? getPreviousPregnancyOutcomeCode(history);
    addText(`Previous pregnancy outcome code: ${historyCode} (0 None, 1 Previous Multiple Pregnancy, 2 Previous Multiple Pregnancy with birth, 3 Previous Pregnancy Outcome Unknown)`);
    addText(`Previous outcomes: ${valueOrNone(history?.outcomes?.join(', '))}; Complications: ${valueOrNone(history?.complications?.join(', '))}`);
    addText(`Symptoms: ${valueOrNone(record.symptoms?.join(', '))}`);
    addText(`Alert status: ${valueOrNone(record.result.alertStatus)}`);
    addText(`Risk factors: ${valueOrNone(record.result.factors?.join('; '))}`);
    addText(`Recommendations: ${valueOrNone(record.result.recommendations?.join('; '))}`);
    if (record.notes) addText(`Notes: ${record.notes}`);
  });

  document.save(`mamacare_assessment_report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
