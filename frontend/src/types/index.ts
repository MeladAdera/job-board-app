//frontend/src/types/index.ts
export type UserRole = 'candidate' | 'recruiter';
export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  resume_url?: string;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_range: string;
  employment_type: string;
  skills: string[];
  recruiter_id: number;
  created_at: string;
}

export interface Application {
  id: number;
  job_id: number;
  candidate_id: number;
  cover_letter: string;
  resume_url?: string;
  status: ApplicationStatus;
  created_at: string;
  job?: Job;
  user?: User;
}
// 🎯 نعرف الـ interfaces الجديدة
export interface JobFilters {
  search?: string;
  location?: string;
  employment_type?: string;
  min_salary?: number;
  max_salary?: number;
  page?: number;
  limit?: number;
}