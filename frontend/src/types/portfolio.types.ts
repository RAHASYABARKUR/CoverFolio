// Portfolio Types
export interface Portfolio {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  title: string;
  bio: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  twitter?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  projects?: Project[];
  skills?: Skill[];
  experiences?: Experience[];
  education?: Education[];
  certifications?: Certification[];
  projects_count?: number;
  skills_count?: number;
  experiences_count?: number;
  education_count?: number;
  certifications_count?: number;
}

export interface Project {
  id: number;
  portfolio: number;
  title: string;
  description: string;
  tech_stack: string[];
  start_date: string;
  end_date?: string;
  project_url?: string;
  demo_url?: string;
  github_url?: string;
  status: 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  duration?: string;
}

export interface Skill {
  id: number;
  portfolio: number;
  name: string;
  category: 'programming' | 'framework' | 'tool' | 'soft_skill' | 'language' | 'other';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience?: number;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: number;
  portfolio: number;
  company: string;
  position: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';
  location: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string;
  responsibilities?: string;
  achievements?: string;
  technologies: string[];
  company_url?: string;
  created_at: string;
  updated_at: string;
  duration?: string;
}

export interface Education {
  id: number;
  portfolio: number;
  institution: string;
  degree: 'high_school' | 'associate' | 'bachelors' | 'masters' | 'phd' | 'bootcamp' | 'certification' | 'other';
  field_of_study: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  grade?: string;
  description?: string;
  institution_url?: string;
  created_at: string;
  updated_at: string;
  duration?: string;
}

export interface Certification {
  id: number;
  portfolio: number;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_expired?: boolean;
}

// Form data types (for creating/updating)
export interface PortfolioFormData {
  title: string;
  bio: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  twitter?: string;
  is_public: boolean;
}

export interface ProjectFormData {
  title: string;
  description: string;
  tech_stack: string[];
  start_date: string;
  end_date?: string;
  project_url?: string;
  demo_url?: string;
  github_url?: string;
  status: 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  is_featured: boolean;
}

export interface SkillFormData {
  name: string;
  category: 'programming' | 'framework' | 'tool' | 'soft_skill' | 'language' | 'other';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience?: number;
}

export interface ExperienceFormData {
  company: string;
  position: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';
  location: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string;
  responsibilities?: string;
  achievements?: string;
  technologies: string[];
  company_url?: string;
}

export interface EducationFormData {
  institution: string;
  degree: 'high_school' | 'associate' | 'bachelors' | 'masters' | 'phd' | 'bootcamp' | 'certification' | 'other';
  field_of_study: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  grade?: string;
  description?: string;
  institution_url?: string;
}

export interface CertificationFormData {
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  description?: string;
}
