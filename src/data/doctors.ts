export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  bio: string;
  languages: string[];
  rating: number;
  reviews: number;
  available: boolean;
  nextAvailable: string;
  ethnicity: 'black' | 'arab' | 'white' | 'asian' | 'other';
  email: string;
  phone: string;
  education: string;
  certifications: string[];
  experience: number;
  consultationFee: number;
  availability: {
    day: string;
    slots: string[];
  }[];
}

export const doctors: Doctor[] = [
  {
    id: 'dr-amara-okofor',
    name: 'Dr. Amara Okafor',
    specialty: 'Obstetrics & Gynecology',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
    bio: 'Dr. Amara Okafor is a board-certified obstetrician and gynecologist with over 15 years of experience in maternal health. She specializes in high-risk pregnancies and has helped deliver over 3,000 babies. Her compassionate approach and expertise make her a trusted partner for mothers throughout their pregnancy journey.',
    languages: ['English', 'Igbo'],
    rating: 4.9,
    reviews: 128,
    available: true,
    nextAvailable: 'Today, 2:00 PM',
    ethnicity: 'black',
    email: 'amara.okafor@mamacare.app',
    phone: '+234 801 234 5678',
    education: 'University of Lagos Medical School',
    certifications: ['FRCOG', 'FWACS', 'MBBS'],
    experience: 15,
    consultationFee: 15000,
    availability: [
      { day: 'Monday', slots: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'] },
      { day: 'Wednesday', slots: ['10:00 AM', '1:00 PM', '3:00 PM'] },
      { day: 'Friday', slots: ['9:00 AM', '12:00 PM', '2:00 PM'] },
    ],
  },
  {
    id: 'dr-fatima-alrashid',
    name: 'Dr. Fatima Al-Rashid',
    specialty: 'Maternal-Fetal Medicine',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    bio: 'Dr. Fatima Al-Rashid is a specialist in maternal-fetal medicine with expertise in managing high-risk pregnancies, prenatal diagnostics, and fetal therapy. She has trained at leading institutions in the Middle East and brings a wealth of knowledge to her practice.',
    languages: ['English', 'Arabic'],
    rating: 4.8,
    reviews: 96,
    available: true,
    nextAvailable: 'Tomorrow, 10:00 AM',
    ethnicity: 'arab',
    email: 'fatima.alrashid@mamacare.app',
    phone: '+234 802 345 6789',
    education: 'Cairo University Medical School',
    certifications: ['MFM', 'FRCOG', 'MD'],
    experience: 12,
    consultationFee: 20000,
    availability: [
      { day: 'Tuesday', slots: ['9:00 AM', '11:00 AM', '2:00 PM'] },
      { day: 'Thursday', slots: ['10:00 AM', '1:00 PM', '4:00 PM'] },
      { day: 'Saturday', slots: ['9:00 AM', '12:00 PM'] },
    ],
  },
  {
    id: 'dr-sarah-mitchell',
    name: 'Dr. Sarah Mitchell',
    specialty: 'Obstetrics & Gynecology',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    bio: 'Dr. Sarah Mitchell is an experienced OB/GYN with a special interest in natural childbirth and prenatal care. She believes in empowering mothers with knowledge and supporting them through every step of their pregnancy journey.',
    languages: ['English', 'French'],
    rating: 4.9,
    reviews: 156,
    available: true,
    nextAvailable: 'Today, 4:30 PM',
    ethnicity: 'white',
    email: 'sarah.mitchell@mamacare.app',
    phone: '+234 803 456 7890',
    education: 'Johns Hopkins School of Medicine',
    certifications: ['FACOG', 'FRCOG', 'MD'],
    experience: 18,
    consultationFee: 18000,
    availability: [
      { day: 'Monday', slots: ['10:00 AM', '2:00 PM', '4:00 PM'] },
      { day: 'Tuesday', slots: ['9:00 AM', '11:00 AM', '3:00 PM'] },
      { day: 'Thursday', slots: ['10:00 AM', '1:00 PM', '4:00 PM'] },
    ],
  },
  {
    id: 'dr-ngozi-adeyemi',
    name: 'Dr. Ngozi Adeyemi',
    specialty: 'Reproductive Endocrinology',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop',
    bio: 'Dr. Ngozi Adeyemi is a fertility specialist dedicated to helping couples achieve their dream of parenthood. With her expertise in reproductive endocrinology and compassionate care, she has helped hundreds of families welcome new life.',
    languages: ['English', 'Yoruba'],
    rating: 4.7,
    reviews: 84,
    available: false,
    nextAvailable: 'Monday, 9:00 AM',
    ethnicity: 'black',
    email: 'ngozi.adeyemi@mamacare.app',
    phone: '+234 804 567 8901',
    education: 'University of Ibadan Medical School',
    certifications: ['FWACS', 'FRCOG', 'MBChB'],
    experience: 10,
    consultationFee: 22000,
    availability: [
      { day: 'Monday', slots: ['9:00 AM', '11:00 AM', '2:00 PM'] },
      { day: 'Wednesday', slots: ['10:00 AM', '1:00 PM'] },
      { day: 'Friday', slots: ['9:00 AM', '12:00 PM'] },
    ],
  },
  {
    id: 'dr-aisha-hassan',
    name: 'Dr. Aisha Hassan',
    specialty: 'Midwifery & Natural Birth',
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop',
    bio: 'Dr. Aisha Hassan is a certified midwife and advocate for natural childbirth. She provides holistic care that honors the natural process of birth while ensuring the safety of both mother and baby.',
    languages: ['English', 'Hausa', 'Arabic'],
    rating: 4.8,
    reviews: 112,
    available: true,
    nextAvailable: 'Today, 6:00 PM',
    ethnicity: 'arab',
    email: 'aisha.hassan@mamacare.app',
    phone: '+234 805 678 9012',
    education: 'Ahmadu Bello University',
    certifications: ['RM', 'BSc Midwifery', 'MPH'],
    experience: 14,
    consultationFee: 12000,
    availability: [
      { day: 'Tuesday', slots: ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'] },
      { day: 'Thursday', slots: ['10:00 AM', '2:00 PM', '5:00 PM'] },
      { day: 'Saturday', slots: ['9:00 AM', '11:00 AM'] },
    ],
  },
  {
    id: 'dr-emily-johnson',
    name: 'Dr. Emily Johnson',
    specialty: 'Pediatric Obstetrics',
    image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=400&fit=crop',
    bio: 'Dr. Emily Johnson specializes in adolescent pregnancy and maternal health education. She is passionate about providing comprehensive care and education to young mothers, ensuring they have the support they need.',
    languages: ['English'],
    rating: 4.9,
    reviews: 143,
    available: true,
    nextAvailable: 'Tomorrow, 11:30 AM',
    ethnicity: 'white',
    email: 'emily.johnson@mamacare.app',
    phone: '+234 806 789 0123',
    education: 'Harvard Medical School',
    certifications: ['FACOG', 'MPH', 'MD'],
    experience: 11,
    consultationFee: 16000,
    availability: [
      { day: 'Monday', slots: ['11:00 AM', '2:00 PM', '4:00 PM'] },
      { day: 'Wednesday', slots: ['9:00 AM', '11:30 AM', '3:00 PM'] },
      { day: 'Friday', slots: ['10:00 AM', '1:00 PM', '4:00 PM'] },
    ],
  },
  {
    id: 'dr-wei-chen',
    name: 'Dr. Wei Chen',
    specialty: 'Gynecologic Surgery',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop',
    bio: 'Dr. Wei Chen is a skilled gynecologic surgeon specializing in minimally invasive procedures. His expertise in laparoscopic and robotic surgery ensures patients receive the best care with minimal recovery time.',
    languages: ['English', 'Mandarin'],
    rating: 4.8,
    reviews: 89,
    available: true,
    nextAvailable: 'Today, 3:00 PM',
    ethnicity: 'asian',
    email: 'wei.chen@mamacare.app',
    phone: '+234 807 890 1234',
    education: 'Peking Union Medical College',
    certifications: ['FACS', 'MD', 'PhD'],
    experience: 16,
    consultationFee: 25000,
    availability: [
      { day: 'Monday', slots: ['9:00 AM', '1:00 PM', '3:00 PM'] },
      { day: 'Thursday', slots: ['10:00 AM', '2:00 PM', '4:00 PM'] },
      { day: 'Saturday', slots: ['10:00 AM', '12:00 PM'] },
    ],
  },
  {
    id: 'dr-zanele-mthembu',
    name: 'Dr. Zanele Mthembu',
    specialty: 'Prenatal Nutrition',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop',
    bio: 'Dr. Zanele Mthembu is a nutritionist specializing in prenatal and postnatal nutrition. She helps mothers maintain optimal health through proper diet and nutrition planning throughout their pregnancy journey.',
    languages: ['English', 'Zulu', 'Xhosa'],
    rating: 4.9,
    reviews: 76,
    available: true,
    nextAvailable: 'Tomorrow, 9:00 AM',
    ethnicity: 'black',
    email: 'zanele.mthembu@mamacare.app',
    phone: '+234 808 901 2345',
    education: 'University of Cape Town',
    certifications: ['RD', 'PhD Nutrition', 'MPH'],
    experience: 9,
    consultationFee: 10000,
    availability: [
      { day: 'Tuesday', slots: ['9:00 AM', '11:00 AM', '2:00 PM'] },
      { day: 'Friday', slots: ['10:00 AM', '1:00 PM', '3:00 PM'] },
    ],
  },
];

export const getDoctorById = (id: string): Doctor | undefined => {
  return doctors.find(d => d.id === id);
};

export const getDoctorsByEthnicity = (ethnicity: Doctor['ethnicity']): Doctor[] => {
  return doctors.filter(d => d.ethnicity === ethnicity);
};

export const getAvailableDoctors = (): Doctor[] => {
  return doctors.filter(d => d.available);
};

export const searchDoctors = (query: string): Doctor[] => {
  const lowerQuery = query.toLowerCase();
  return doctors.filter(d => 
    d.name.toLowerCase().includes(lowerQuery) ||
    d.specialty.toLowerCase().includes(lowerQuery) ||
    d.languages.some(l => l.toLowerCase().includes(lowerQuery))
  );
};
