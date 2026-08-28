export interface RiskAssessmentData {
  age: number;
  systolicBP: number;
  diastolicBP: number;
  bloodSugar: number;
  bodyTemp: number;
  heartRate: number;
}

export interface RiskResult {
  level: 'low' | 'medium' | 'high';
  score: number;
  confidence: number;
  recommendations: string[];
  keyFactors: string[];
  factors?: string[];
  vitalContributions?: Array<{ feature: string; label: string; contribution: number; reason: string; value: number }>;
  symptomContributions?: Array<{ symptom: string; contribution: number; reason: string }>;
  correlations?: Array<{ symptom: string; vital: string; vitalLabel: string; vitalValue: number; relationship: string; strength: string }>;
  previousRisk?: number | null;
  deltaRisk?: number | null;
  alertStatus?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  quote: string;
  avatar: string;
}

export interface WearableDevice {
  id: string;
  name: string;
  description: string;
  features: string[];
  image: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
  image: string;
}

export interface Translation {
  [key: string]: string | Translation;
}
