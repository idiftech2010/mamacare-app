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
  confidence: number;
  recommendations: string[];
  keyFactors: string[];
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
