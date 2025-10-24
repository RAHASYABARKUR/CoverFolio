import api from './api';
import {
  Portfolio,
  Project,
  Skill,
  Experience,
  Education,
  Certification,
  PortfolioFormData,
  ProjectFormData,
  SkillFormData,
  ExperienceFormData,
  EducationFormData,
  CertificationFormData,
} from '../types/portfolio.types';

class PortfolioService {
  // Portfolio endpoints
  async getPortfolio(): Promise<Portfolio> {
    const response = await api.get<Portfolio>('/api/portfolio/');
    return response.data;
  }

  async createPortfolio(data: PortfolioFormData): Promise<Portfolio> {
    const response = await api.post<Portfolio>('/api/portfolio/', data);
    return response.data;
  }

  async updatePortfolio(data: Partial<PortfolioFormData>): Promise<Portfolio> {
    const response = await api.patch<Portfolio>('/api/portfolio/', data);
    return response.data;
  }

  async getPublicPortfolio(userId: number): Promise<Portfolio> {
    const response = await api.get<Portfolio>(`/api/portfolio/public/${userId}/`);
    return response.data;
  }

  // Project endpoints
  async getProjects(): Promise<Project[]> {
    const response = await api.get<{ projects: Project[]; count: number }>('/api/portfolio/projects/');
    return response.data.projects;
  }

  async createProject(data: ProjectFormData): Promise<{ message: string; project: Project }> {
    const response = await api.post<{ message: string; project: Project }>(
      '/api/portfolio/projects/',
      data
    );
    return response.data;
  }

  async updateProject(
    id: number,
    data: Partial<ProjectFormData>
  ): Promise<{ message: string; project: Project }> {
    const response = await api.patch<{ message: string; project: Project }>(
      `/api/portfolio/projects/${id}/`,
      data
    );
    return response.data;
  }

  async deleteProject(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/api/portfolio/projects/${id}/`);
    return response.data;
  }

  // Skill endpoints
  async getSkills(): Promise<Skill[]> {
    const response = await api.get<{ skills: Skill[]; count: number }>('/api/portfolio/skills/');
    return response.data.skills;
  }

  async createSkill(data: SkillFormData): Promise<{ message: string; skill: Skill }> {
    const response = await api.post<{ message: string; skill: Skill }>(
      '/api/portfolio/skills/',
      data
    );
    return response.data;
  }

  async updateSkill(
    id: number,
    data: Partial<SkillFormData>
  ): Promise<{ message: string; skill: Skill }> {
    const response = await api.patch<{ message: string; skill: Skill }>(
      `/api/portfolio/skills/${id}/`,
      data
    );
    return response.data;
  }

  async deleteSkill(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/api/portfolio/skills/${id}/`);
    return response.data;
  }

  // Experience endpoints
  async getExperiences(): Promise<Experience[]> {
    const response = await api.get<{ experiences: Experience[]; count: number }>('/api/portfolio/experiences/');
    return response.data.experiences;
  }

  async createExperience(
    data: ExperienceFormData
  ): Promise<{ message: string; experience: Experience }> {
    const response = await api.post<{ message: string; experience: Experience }>(
      '/api/portfolio/experiences/',
      data
    );
    return response.data;
  }

  async updateExperience(
    id: number,
    data: Partial<ExperienceFormData>
  ): Promise<{ message: string; experience: Experience }> {
    const response = await api.patch<{ message: string; experience: Experience }>(
      `/api/portfolio/experiences/${id}/`,
      data
    );
    return response.data;
  }

  async deleteExperience(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/api/portfolio/experiences/${id}/`);
    return response.data;
  }

  // Education endpoints
  async getEducation(): Promise<Education[]> {
    const response = await api.get<{ education: Education[]; count: number }>('/api/portfolio/education/');
    return response.data.education;
  }

  async createEducation(
    data: EducationFormData
  ): Promise<{ message: string; education: Education }> {
    const response = await api.post<{ message: string; education: Education }>(
      '/api/portfolio/education/',
      data
    );
    return response.data;
  }

  async updateEducation(
    id: number,
    data: Partial<EducationFormData>
  ): Promise<{ message: string; education: Education }> {
    const response = await api.patch<{ message: string; education: Education }>(
      `/api/portfolio/education/${id}/`,
      data
    );
    return response.data;
  }

  async deleteEducation(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/api/portfolio/education/${id}/`);
    return response.data;
  }

  // Certification endpoints
  async getCertifications(): Promise<Certification[]> {
    const response = await api.get<{ certifications: Certification[]; count: number }>('/api/portfolio/certifications/');
    return response.data.certifications;
  }

  async createCertification(
    data: CertificationFormData
  ): Promise<{ message: string; certification: Certification }> {
    const response = await api.post<{ message: string; certification: Certification }>(
      '/api/portfolio/certifications/',
      data
    );
    return response.data;
  }

  async updateCertification(
    id: number,
    data: Partial<CertificationFormData>
  ): Promise<{ message: string; certification: Certification }> {
    const response = await api.patch<{ message: string; certification: Certification }>(
      `/api/portfolio/certifications/${id}/`,
      data
    );
    return response.data;
  }

  async deleteCertification(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/api/portfolio/certifications/${id}/`
    );
    return response.data;
  }
}

const portfolioService = new PortfolioService();
export default portfolioService;
