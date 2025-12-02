import api from './api';

export interface CoverLetter {
  id: number;
  title: string;
  role: string;
  company_name: string;
  content: string;
  template_style: 'professional' | 'modern' | 'creative' | 'header';
  font_family: string;
  font_size: 'small' | 'medium' | 'large';
  text_align: 'left' | 'center' | 'justify';
  created_at: string;
  updated_at: string;
}

export interface SaveCoverLetterRequest {
  title: string;
  role?: string;
  company_name?: string;
  content: string;
  template_style?: string;
  font_family?: string;
  font_size?: string;
  text_align?: string;
  resume_id?: number;
}

class CoverLetterService {
  async saveDraft(data: SaveCoverLetterRequest): Promise<CoverLetter> {
    const response = await api.post('/api/resume/cover-letters/save/', data);
    return response.data.cover_letter;
  }

  async listDrafts(): Promise<CoverLetter[]> {
    const response = await api.get('/api/resume/cover-letters/list/');
    return response.data.cover_letters;
  }

  async getDraft(id: number): Promise<CoverLetter> {
    const response = await api.get(`/api/resume/cover-letters/${id}/`);
    return response.data;
  }

  async updateDraft(id: number, data: Partial<SaveCoverLetterRequest>): Promise<CoverLetter> {
    const response = await api.put(`/api/resume/cover-letters/${id}/update/`, data);
    return response.data.cover_letter;
  }

  async deleteDraft(id: number): Promise<void> {
    await api.delete(`/api/resume/cover-letters/${id}/delete/`);
  }

  async getCount(): Promise<number> {
    const response = await api.get('/api/resume/cover-letters/list/');
    return response.data.count || 0;
  }
}

const coverLetterService = new CoverLetterService();
export default coverLetterService;
