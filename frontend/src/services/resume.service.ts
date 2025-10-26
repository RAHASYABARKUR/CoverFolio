import api from './api';

export interface Resume {
  id: number;
  title: string;
  file_path: string;
  extracted_text: string;
  structured_data: {
    name: string | null;
    email: string | null;
    phone: string | null;
    linkedin: string | null;
    github: string | null;
    education: Array<{ degree: string | null; institution: string | null; year: string | null; gpa: string | null }>;
    experience: Array<{ company: string | null; role: string | null; years: string | null; role_summary: string | null }>;
    projects: Array<{ title: string | null; description: string | null; technologies: string[] }>;
    skills: string[];
    extracurriculars: string[];
  } | null;
  created_at: string;
  updated_at: string;
}


// ---- API response shapes (match your Django views) ----
type UploadResumeResponse = { message: string; resume: Resume };        // views.upload_resume returns { message, resume } 
type ListResumesResponse  = { resumes: Resume[] };                      // views.list_resumes returns { resumes: [...] } 
type DeleteResponse       = { message: string };                        // views.delete_resume returns { message } 
// get_resume returns the Resume object directly (no wrapper) 

class ResumeService {
  async listResumes(): Promise<Resume[]> {
    const res = await api.get<ListResumesResponse>('/api/resume/list/');
    return res.data.resumes;
  }

  async getResume(id: number): Promise<Resume> {
    const res = await api.get<Resume>(`/api/resume/${id}/`);
    return res.data;
  }

  async uploadResume(file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    console.log('Uploading file:', file.name);
    const res = await api.post<UploadResumeResponse>('/api/resume/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
  console.log('Raw API response:', res);
  console.log('Response data:', res.data);
  console.log('Parsed resume object:', res.data.resume);
  console.log('Structured data returned:', res.data.resume?.structured_data);
    return res.data.resume; // <-- now correctly typed
  }

  async deleteResume(id: number): Promise<DeleteResponse> {
    // Django route is /api/resume/<id>/delete/ per urls.py, not /api/resume/<id>/ 
    const res = await api.delete<DeleteResponse>(`/api/resume/${id}/delete/`);
    return res.data;
  }
}

const resumeService = new ResumeService();
export default resumeService;
