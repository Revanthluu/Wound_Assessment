
export enum UserRole {
    ADMIN = 'ADMIN',
    DOCTOR = 'DOCTOR',
    NURSE = 'NURSE',
    PATIENT = 'PATIENT'
}

export interface Patient {
    id: string;
    mrn: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    admissionDate: string;
    ward: string;
    room: string;
    status: 'Active' | 'Recovered';
    user_id?: number;
    doctor_id?: number;
    previousWound?: string;
    healingTime?: string;
    diabetes?: string;
    ulcer?: string;
    bp?: string;
}

export interface Assessment {
    id: string;
    patient_id: string;
    date: string;
    wound_location: string;
    wound_type: string;
    wound_stage: string;
    length_cm: number;
    width_cm: number;
    depth_cm: number;
    pain_level: number;
    notes: string;
    image_data?: string;
    granulation_pct: number;
    epithelial_pct?: number;
    slough_pct?: number;
    eschar_pct?: number;
    marker_data?: string;
    status: 'Healing' | 'Deteriorating' | 'Stable';
    doctor_suggestion?: string;
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
    fullName: string;
    visitCount: number;
    lastLogin: string;
    age?: number;
    experience?: string;
    gender?: string;
    license_no?: string;
}

export interface Alert {
    id: number;
    patient_id: string;
    assessment_id: string;
    message: string;
    is_read: boolean;
    created_at: string;
    first_name: string;
    last_name: string;
}

export interface Task {
    id: number;
    doctor_id: number;
    nurse_id: number;
    patient_id: string;
    title: string;
    description: string;
    due_date: string;
    status: 'PENDING' | 'COMPLETED';
    nurse_note?: string;
    created_at: string;
    doctor_name?: string;
    first_name?: string;
    last_name?: string;
}
