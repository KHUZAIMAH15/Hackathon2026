export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export type AppointmentType = 'consultation' | 'follow-up' | 'emergency' | 'checkup';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Schedule {
  doctorId: string;
  date: string;
  slots: TimeSlot[];
}
