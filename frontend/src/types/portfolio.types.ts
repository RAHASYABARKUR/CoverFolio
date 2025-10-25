// Portfolio Types
export interface Portfolio {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  title: string;
  bio: string;
  profile_image?: string;
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
  hobbies?: Hobby[];
  awards?: Award[];
  contacts?: Contact[];
  projects_count?: number;
  skills_count?: number;
  experiences_count?: number;
  education_count?: number;
  certifications_count?: number;
  hobbies_count?: number;
  awards_count?: number;
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
  status: 'in_progress' | 'completed' | 'planned';
  featured: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  duration?: string;
}

export interface Skill {
  id: number;
  portfolio: number;
  name: string;
  category: 'programming' | 'framework' | 'tool' | 'soft_skill' | 'language' | 'other';
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
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
  degree: 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'certificate' | 'bootcamp' | 'other';
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

export interface Hobby {
  id: number;
  portfolio: number;
  name: string;
  description: string;
  category: 'sports' | 'arts' | 'volunteer' | 'club' | 'creative' | 'other';
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  achievements?: string;
  created_at: string;
  updated_at: string;
  duration?: string;
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
  start_date?: string | null;
  end_date?: string | null;
  project_url?: string;
  demo_url?: string;
  github_url?: string;
  status: 'in_progress' | 'completed' | 'planned';
  featured: boolean;
}

export interface SkillFormData {
  name: string;
  category: 'programming' | 'framework' | 'tool' | 'soft_skill' | 'language' | 'other';
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
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
  technologies: string[];
  company_url?: string;
}

export interface EducationFormData {
  institution: string;
  degree: 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'certificate' | 'bootcamp' | 'other';
  field_of_study: string;
  start_date?: string | null;
  end_date?: string | null;
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

export interface HobbyFormData {
  name: string;
  description: string;
  category: 'sports' | 'arts' | 'volunteer' | 'club' | 'creative' | 'other';
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  achievements?: string;
}

export interface Award {
  id: number;
  title: string;
  issuer: string;
  date: string;
  category: 'academic' | 'professional' | 'competition' | 'scholarship' | 'leadership' | 'community' | 'publication' | 'patent' | 'other';
  description: string;
  url: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface AwardFormData {
  title: string;
  issuer: string;
  date: string | null;
  category: 'academic' | 'professional' | 'competition' | 'scholarship' | 'leadership' | 'community' | 'publication' | 'patent' | 'other';
  description?: string;
  url?: string;
}

export interface Contact {
  id: number;
  contact_type: 'email' | 'phone' | 'website' | 'linkedin' | 'github' | 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'portfolio' | 'blog' | 'other';
  label: string;
  value: string;
  is_primary: boolean;
  is_public: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  contact_type: 'email' | 'phone' | 'website' | 'linkedin' | 'github' | 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'portfolio' | 'blog' | 'other';
  label: string;
  value: string;
  is_primary: boolean;
  is_public: boolean;
}

export interface Publication {
  id: number;
  title: string;
  authors: string;
  publication_type: 'journal' | 'conference' | 'book' | 'chapter' | 'thesis' | 'preprint' | 'magazine' | 'blog' | 'other';
  publisher: string;
  publication_date: string;
  doi?: string;
  url?: string;
  description?: string;
  citation_count: number;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface PublicationFormData {
  title: string;
  authors: string;
  publication_type: 'journal' | 'conference' | 'book' | 'chapter' | 'thesis' | 'preprint' | 'magazine' | 'blog' | 'other';
  publisher?: string;
  publication_date: string;
  doi?: string;
  url?: string;
  description?: string;
  citation_count?: number;
}


export interface Patent {
  id: number;
  title: string;
  inventors: string;
  patent_number?: string;
  status: 'granted' | 'pending' | 'filed' | 'published' | 'expired';
  filing_date: string;
  issue_date?: string;
  patent_office?: string;
  url?: string;
  description?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface PatentFormData {
  title: string;
  inventors: string;
  patent_number?: string;
  status: 'granted' | 'pending' | 'filed' | 'published' | 'expired';
  filing_date: string;
  issue_date?: string;
  patent_office?: string;
  url?: string;
  description?: string;
}

export interface Other {
  id: number;
  title: string;
  category?: string;
  description?: string;
  date?: string;
  url?: string;
  tags?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface OtherFormData {
  title: string;
  category?: string;
  description?: string;
  date?: string;
  url?: string;
  tags?: string;
}

