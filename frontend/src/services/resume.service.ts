import api from './api';

export interface Resume {
  id: number;
  title: string;
  file_path: string;
  extracted_text: string;
  structured_data: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      gpa: string;
    }>;
    experience: Array<{
      company: string;
      role: string;
      years: string;
      role_summary: string;
    }>;
    projects: Array<{
      title: string;
      description: string;
      technologies: string[];
    }>;
    skills: string[];
    extracurriculars: string[];
  } | null;
  created_at: string;
  updated_at: string;
}

class ResumeService {
  async listResumes(): Promise<Resume[]> {
    const response = await api.get<Resume[]>('/api/resume/list/');
    return response.data;
  }

  async getResume(id: number): Promise<Resume> {
    const response = await api.get<Resume>(`/api/resume/${id}/`);
    return response.data;
  }

  async uploadResume(file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<Resume>('/api/resume/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteResume(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/api/resume/${id}/`);
    return response.data;
  }
}

const resumeService = new ResumeService();
export default resumeService;
