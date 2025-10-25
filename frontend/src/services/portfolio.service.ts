import api from './api';
import {
  Portfolio,
  Project,
  Skill,
  Experience,
  Education,
  Certification,
  Hobby,
  Award,
  PortfolioFormData,
  ProjectFormData,
  SkillFormData,
  ExperienceFormData,
  EducationFormData,
  CertificationFormData,
  HobbyFormData,
  AwardFormData,
  Contact,
  ContactFormData,
  Publication,
  PublicationFormData,
  Patent,
  PatentFormData,
  Other,
  OtherFormData,
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

  async uploadProfileImage(file: File): Promise<Portfolio> {
    const formData = new FormData();
    formData.append('profile_image', file);
    const response = await api.patch<Portfolio>('/api/portfolio/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteProfileImage(): Promise<Portfolio> {
    const response = await api.patch<Portfolio>('/api/portfolio/', { profile_image: null });
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

  async listCertifications(): Promise<Certification[]> {
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

  // Hobby endpoints
  async getHobbies(): Promise<{ hobbies: Hobby[]; count: number }> {
    const response = await api.get<{ hobbies: Hobby[]; count: number }>('/api/portfolio/hobbies/');
    return response.data;
  }

  async listHobbies(): Promise<Hobby[]> {
    const response = await api.get<{ hobbies: Hobby[]; count: number }>('/api/portfolio/hobbies/');
    return response.data.hobbies;
  }

  async createHobby(data: HobbyFormData): Promise<{ message: string; hobby: Hobby }> {
    const response = await api.post<{ message: string; hobby: Hobby }>(
      '/api/portfolio/hobbies/',
      data
    );
    return response.data;
  }

  async updateHobby(id: number, data: Partial<HobbyFormData>): Promise<{ message: string; hobby: Hobby }> {
    const response = await api.patch<{ message: string; hobby: Hobby }>(
      `/api/portfolio/hobbies/${id}/`,
      data
    );
    return response.data;
  }

  async deleteHobby(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/api/portfolio/hobbies/${id}/`
    );
    return response.data;
  }

  // Awards
  async listAwards(): Promise<Award[]> {
    const response = await api.get<Award[]>('/api/portfolio/awards/');
    return response.data;
  }

  async createAward(data: AwardFormData): Promise<{ message: string; award: Award }> {
    const response = await api.post<{ message: string; award: Award }>(
      '/api/portfolio/awards/',
      data
    );
    return response.data;
  }

  async updateAward(id: number, data: Partial<AwardFormData>): Promise<{ message: string; award: Award }> {
    const response = await api.patch<{ message: string; award: Award }>(
      `/api/portfolio/awards/${id}/`,
      data
    );
    return response.data;
  }

  async deleteAward(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/api/portfolio/awards/${id}/`
    );
    return response.data;
  }

  // Contacts
  async listContacts(): Promise<Contact[]> {
    const response = await api.get<Contact[]>('/api/portfolio/contacts/');
    return response.data;
  }

  async createContact(data: ContactFormData): Promise<{ message: string; contact: Contact }> {
    const response = await api.post<{ message: string; contact: Contact }>(
      '/api/portfolio/contacts/',
      data
    );
    return response.data;
  }

  async updateContact(id: number, data: Partial<ContactFormData>): Promise<{ message: string; contact: Contact }> {
    const response = await api.patch<{ message: string; contact: Contact }>(
      `/api/portfolio/contacts/${id}/`,
      data
    );
    return response.data;
  }

  async deleteContact(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/api/portfolio/contacts/${id}/`
    );
    return response.data;
  }

  // Auto-populate from resume
  async populateFromResume(resumeId: number, overwrite: boolean = false): Promise<{
    message: string;
    portfolio_id: number;
    statistics: {
      created: {
        education: number;
        experience: number;
        projects: number;
        skills: number;
        hobbies: number;
      };
      skipped: {
        education: number;
        experience: number;
        projects: number;
        skills: number;
        hobbies: number;
      };
    };
  }> {
    const response = await api.post(`/api/portfolio/populate-from-resume/${resumeId}/`, {
      overwrite
    });
    return response.data;
  }

  // Publications
  async listPublications(): Promise<Publication[]> {
    const response = await api.get<{ publications: Publication[]; count: number }>('/api/portfolio/publications/');
    return response.data.publications;
  }

  async createPublication(
    data: PublicationFormData
  ): Promise<{ message: string; publication: Publication }> {
    const response = await api.post<{ message: string; publication: Publication }>(
      '/api/portfolio/publications/',
      data
    );
    return response.data;
  }

  async updatePublication(
    id: number,
    data: Partial<PublicationFormData>
  ): Promise<{ message: string; publication: Publication }> {
    const response = await api.patch<{ message: string; publication: Publication }>(
      `/api/portfolio/publications/${id}/`,
      data
    );
    return response.data;
  }

  async deletePublication(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/api/portfolio/publications/${id}/`
    );
    return response.data;
  }

  // Patents
  async listPatents(): Promise<Patent[]> {
    const response = await api.get<{ patents: Patent[]; count: number }>('/api/portfolio/patents/');
    return response.data.patents;
  }

  async createPatent(
    data: PatentFormData
  ): Promise<{ message: string; patent: Patent }> {
    const response = await api.post<{ message: string; patent: Patent }>(
      '/api/portfolio/patents/',
      data
    );
    return response.data;
  }

  async updatePatent(
    id: number,
    data: Partial<PatentFormData>
  ): Promise<{ message: string; patent: Patent }> {
    const response = await api.patch<{ message: string; patent: Patent }>(
      `/api/portfolio/patents/${id}/`,
      data
    );
    return response.data;
  }

  async deletePatent(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/api/portfolio/patents/${id}/`
    );
    return response.data;
  }

  // Other endpoints
  async listOthers(): Promise<Other[]> {
    const response = await api.get<{ others: Other[]; count: number }>(
      '/api/portfolio/others/'
    );
    return response.data.others;
  }

  async createOther(
    data: OtherFormData
  ): Promise<{ message: string; other: Other }> {
    const response = await api.post<{ message: string; other: Other }>(
      '/api/portfolio/others/',
      data
    );
    return response.data;
  }

  async updateOther(
    id: number,
    data: Partial<OtherFormData>
  ): Promise<{ message: string; other: Other }> {
    const response = await api.patch<{ message: string; other: Other }>(
      `/api/portfolio/others/${id}/`,
      data
    );
    return response.data;
  }

  async deleteOther(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/api/portfolio/others/${id}/`
    );
    return response.data;
  }
}

const portfolioService = new PortfolioService();
export default portfolioService;
