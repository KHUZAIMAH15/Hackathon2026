export interface Diagnosis {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  medications: Medication[];
  notes?: string;
  followUpDate?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  type: 'consultation' | 'test' | 'procedure' | 'admission';
  title: string;
  description: string;
  doctorName: string;
  attachments?: string[];
}

export interface TestResult {
  id: string;
  patientId: string;
  testName: string;
  date: string;
  status: 'pending' | 'completed';
  result?: string;
  normalRange?: string;
  flags?: ('low' | 'high' | 'critical')[];
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  medications: Medication[];
  duration: string;
  notes?: string;
}
