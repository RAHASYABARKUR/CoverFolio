import React, { useState, useEffect } from 'react';
import { Project, ProjectFormData } from '../../types/portfolio.types';
import portfolioService from '../../services/portfolio.service';

interface ProjectsSectionProps {
  portfolioId?: number;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ portfolioId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (portfolioId) {
      loadProjects();
    } else {
      setLoading(false);
    }
  }, [portfolioId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.getProjects();
      // Ensure data is an array
      setProjects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      // If error is 404, it means no projects yet
      if (err.response?.status === 404) {
        setProjects([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await portfolioService.deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete project');
    }
  };

  if (!portfolioId) {
    return (
      <div style={styles.emptyState}>
        <p style={styles.emptyText}>Please create your portfolio first before adding projects.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={styles.loading}>Loading projects...</div>;
  }

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.sectionTitle}>Projects</h2>
        <button onClick={() => setIsAdding(true)} style={styles.addButton}>
          + Add Project
        </button>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={styles.closeError}>×</button>
        </div>
      )}

      {isAdding && (
        <ProjectForm
          onCancel={() => setIsAdding(false)}
          onSave={async (data) => {
            await portfolioService.createProject(data);
            await loadProjects();
            setIsAdding(false);
          }}
        />
      )}

      {projects.length === 0 && !isAdding ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💼</div>
          <h3 style={styles.emptyTitle}>No Projects Yet</h3>
          <p style={styles.emptyText}>
            Showcase your work! Add projects to highlight your skills and experience.
          </p>
        </div>
      ) : (
        <div style={styles.projectsGrid}>
          {projects.map((project) =>
            editingId === project.id ? (
              <ProjectForm
                key={project.id}
                project={project}
                onCancel={() => setEditingId(null)}
                onSave={async (data) => {
                  await portfolioService.updateProject(project.id, data);
                  await loadProjects();
                  setEditingId(null);
                }}
              />
            ) : (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => setEditingId(project.id)}
                onDelete={() => handleDelete(project.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const statusColors: Record<string, string> = {
    in_progress: '#3182ce',
    completed: '#38a169',
    on_hold: '#d69e2e',
    cancelled: '#e53e3e',
  };

  const statusLabels: Record<string, string> = {
    in_progress: 'In Progress',
    completed: 'Completed',
    on_hold: 'On Hold',
    cancelled: 'Cancelled',
  };

  return (
    <div style={styles.projectCard}>
      {project.is_featured && <div style={styles.featuredBadge}>⭐ Featured</div>}
      
      <div style={styles.cardHeader}>
        <h3 style={styles.projectTitle}>{project.title}</h3>
        <div style={styles.cardActions}>
          <button onClick={onEdit} style={styles.iconButton} title="Edit">
            ✏️
          </button>
          <button onClick={onDelete} style={styles.iconButton} title="Delete">
            🗑️
          </button>
        </div>
      </div>

      <p style={styles.projectDescription}>{project.description}</p>

      <div style={styles.techStack}>
        {project.tech_stack.map((tech, index) => (
          <span key={index} style={styles.techBadge}>
            {tech}
          </span>
        ))}
      </div>

      <div style={styles.projectMeta}>
        <span
          style={{
            ...styles.statusBadge,
            backgroundColor: statusColors[project.status] + '20',
            color: statusColors[project.status],
          }}
        >
          {statusLabels[project.status]}
        </span>
        <span style={styles.duration}>{project.duration || 'Duration not set'}</span>
      </div>

      <div style={styles.projectLinks}>
        {project.project_url && (
          <a href={project.project_url} target="_blank" rel="noopener noreferrer" style={styles.projectLink}>
            🔗 Project
          </a>
        )}
        {project.demo_url && (
          <a href={project.demo_url} target="_blank" rel="noopener noreferrer" style={styles.projectLink}>
            🚀 Demo
          </a>
        )}
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noopener noreferrer" style={styles.projectLink}>
            💻 GitHub
          </a>
        )}
      </div>
    </div>
  );
};

interface ProjectFormProps {
  project?: Project;
  onCancel: () => void;
  onSave: (data: ProjectFormData) => Promise<void>;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onCancel, onSave }) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: project?.title || '',
    description: project?.description || '',
    tech_stack: project?.tech_stack || [],
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    project_url: project?.project_url || '',
    demo_url: project?.demo_url || '',
    github_url: project?.github_url || '',
    status: project?.status || 'in_progress',
    is_featured: project?.is_featured || false,
  });
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error('Failed to save project:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTech = () => {
    if (techInput.trim() && !formData.tech_stack.includes(techInput.trim())) {
      setFormData({ ...formData, tech_stack: [...formData.tech_stack, techInput.trim()] });
      setTechInput('');
    }
  };

  const removeTech = (tech: string) => {
    setFormData({ ...formData, tech_stack: formData.tech_stack.filter((t) => t !== tech) });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.formTitle}>{project ? 'Edit Project' : 'Add Project'}</h3>

      <div style={styles.formGroup}>
        <label style={styles.label}>Project Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          style={styles.input}
          placeholder="E-Commerce Platform"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={3}
          style={{ ...styles.input, ...styles.textarea }}
          placeholder="Describe your project..."
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Tech Stack</label>
        <div style={styles.techInputContainer}>
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
            style={styles.input}
            placeholder="Add technology (press Enter)"
          />
          <button type="button" onClick={addTech} style={styles.addTechButton}>
            Add
          </button>
        </div>
        <div style={styles.techList}>
          {formData.tech_stack.map((tech) => (
            <span key={tech} style={styles.techTag}>
              {tech}
              <button type="button" onClick={() => removeTech(tech)} style={styles.removeTech}>
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Start Date *</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>End Date</label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Status *</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          style={styles.input}
        >
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Project URL</label>
        <input
          type="url"
          value={formData.project_url}
          onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
          style={styles.input}
          placeholder="https://project.com"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Demo URL</label>
        <input
          type="url"
          value={formData.demo_url}
          onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
          style={styles.input}
          placeholder="https://demo.project.com"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>GitHub URL</label>
        <input
          type="url"
          value={formData.github_url}
          onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
          style={styles.input}
          placeholder="https://github.com/user/project"
        />
      </div>

      <div style={styles.checkboxGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.is_featured}
            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
            style={styles.checkbox}
          />
          <span>⭐ Featured Project</span>
        </label>
      </div>

      <div style={styles.buttonGroup}>
        <button type="submit" disabled={loading} style={styles.submitButton}>
          {loading ? 'Saving...' : project ? 'Update' : 'Add Project'}
        </button>
        <button type="button" onClick={onCancel} style={styles.cancelButton}>
          Cancel
        </button>
      </div>
    </form>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a202c',
    margin: 0,
  },
  addButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#718096',
  },
  loading: {
    textAlign: 'center',
    padding: '48px',
    color: '#718096',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  },
  projectCard: {
    backgroundColor: '#f7fafc',
    borderRadius: '12px',
    padding: '20px',
    position: 'relative',
    border: '1px solid #e2e8f0',
  },
  featuredBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#fef5e7',
    color: '#d69e2e',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  projectTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    margin: 0,
    flex: 1,
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  iconButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
  },
  projectDescription: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  techStack: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '12px',
  },
  techBadge: {
    backgroundColor: '#edf2f7',
    color: '#2d3748',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  projectMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  duration: {
    fontSize: '12px',
    color: '#718096',
  },
  projectLinks: {
    display: 'flex',
    gap: '12px',
  },
  projectLink: {
    fontSize: '13px',
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#f7fafc',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  techInputContainer: {
    display: 'flex',
    gap: '8px',
  },
  addTechButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  techList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  techTag: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  removeTech: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: 0,
    lineHeight: 1,
  },
  checkboxGroup: {
    marginBottom: '20px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2d3748',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  submitButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    color: '#2d3748',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorMessage: {
    backgroundColor: '#fff5f5',
    border: '1px solid #fc8181',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#c53030',
    fontSize: '14px',
  },
  closeError: {
    marginLeft: 'auto',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#c53030',
    cursor: 'pointer',
    fontSize: '20px',
    fontWeight: 'bold',
  },
};

export default ProjectsSection;
