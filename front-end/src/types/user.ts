export type UserRole = 'admin' | 'doctor' | 'patient' | 'receptionist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  licenseNumber: string;
  phone: string;
  availableDays: string[];
  consultationFee: number;
}

export interface Patient extends User {
  role: 'patient';
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Admin extends User {
  role: 'admin';
  department: string;
  permissions: string[];
}

export interface Receptionist extends User {
  role: 'receptionist';
  department: string;
  shift: 'morning' | 'afternoon' | 'night';
}
