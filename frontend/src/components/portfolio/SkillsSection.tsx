import React, { useState, useEffect } from 'react';
import portfolioService from '../../services/portfolio.service';
import { Skill, SkillFormData } from '../../types/portfolio.types';

const SkillsSection: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SkillFormData>({
    name: '',
    category: 'programming',
    proficiency_level: 'intermediate',
    years_of_experience: undefined,
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const skillsData = await portfolioService.getSkills();
      setSkills(skillsData || []);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      setError('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      if (editingSkill) {
        console.log('Updating skill ID:', editingSkill.id, 'with data:', formData);
        await portfolioService.updateSkill(editingSkill.id, formData);
        alert('Skill updated successfully!');
      } else {
        console.log('Creating new skill with data:', formData);
        await portfolioService.createSkill(formData);
        alert('Skill added successfully!');
      }
      resetForm();
      await fetchSkills();
    } catch (err: any) {
      console.error('Failed to save skill:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || JSON.stringify(err.response?.data) || err.message || 'Failed to save skill';
      setError(errorMsg);
      alert('Error: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await portfolioService.deleteSkill(id);
        await fetchSkills();
        alert('Skill deleted successfully!');
      } catch (err: any) {
        console.error('Failed to delete skill:', err);
        const errorMsg = err.response?.data?.error || err.message || 'Failed to delete skill';
        setError(errorMsg);
        alert('Error: ' + errorMsg);
      }
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency_level: skill.proficiency_level,
      years_of_experience: skill.years_of_experience,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'programming',
      proficiency_level: 'intermediate',
      years_of_experience: undefined,
    });
    setEditingSkill(null);
    setShowForm(false);
  };

  const filteredSkills = filterCategory === 'all' 
    ? skills 
    : skills.filter(s => s.category === filterCategory);

  const skillsByCategory = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const categoryLabels: Record<string, string> = {
    programming: 'Programming Languages',
    framework: 'Frameworks & Libraries',
    tool: 'Tools & Platforms',
    soft_skill: 'Soft Skills',
    language: 'Languages',
    other: 'Other',
  };

  const proficiencyColors: Record<string, { bg: string; text: string }> = {
    beginner: { bg: '#DBEAFE', text: '#1E40AF' },
    intermediate: { bg: '#D1FAE5', text: '#065F46' },
    advanced: { bg: '#E9D5FF', text: '#6B21A8' },
    expert: { bg: '#FEE2E2', text: '#991B1B' },
  };

  if (loading) {
    return <div style={styles.loading}>Loading skills...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Skills</h2>
          <p style={styles.subtitle}>Manage your technical and soft skills</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.addButton}
        >
          {showForm ? 'Cancel' : '+ Add Skill'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorBox}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={styles.closeError}>×</button>
        </div>
      )}

      {/* Category Filter */}
      <div style={styles.filterContainer}>
        <button
          onClick={() => setFilterCategory('all')}
          style={filterCategory === 'all' ? styles.filterButtonActive : styles.filterButton}
        >
          All ({skills.length})
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => {
          const count = skills.filter(s => s.category === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              style={filterCategory === key ? styles.filterButtonActive : styles.filterButton}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>
            {editingSkill ? 'Edit Skill' : 'Add New Skill'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label htmlFor="skill-name" style={styles.label}>
                  Skill Name *
                </label>
                <input
                  id="skill-name"
                  name="skill-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input}
                  required
                  placeholder="e.g., JavaScript, Python"
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="skill-category" style={styles.label}>
                  Category *
                </label>
                <select
                  id="skill-category"
                  name="skill-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  style={styles.select}
                  required
                >
                  <option value="programming">Programming Language</option>
                  <option value="framework">Framework/Library</option>
                  <option value="tool">Tool/Platform</option>
                  <option value="soft_skill">Soft Skill</option>
                  <option value="language">Language</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="skill-proficiency" style={styles.label}>
                  Proficiency Level *
                </label>
                <select
                  id="skill-proficiency"
                  name="skill-proficiency"
                  value={formData.proficiency_level}
                  onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value as any })}
                  style={styles.select}
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="skill-years" style={styles.label}>
                  Years of Experience
                </label>
                <input
                  id="skill-years"
                  name="skill-years"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.years_of_experience || ''}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value ? parseFloat(e.target.value) : undefined })}
                  style={styles.input}
                  placeholder="e.g., 3.5"
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={saving}
              >
                {saving ? 'Saving...' : (editingSkill ? 'Update Skill' : 'Add Skill')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Skills Display */}
      {filteredSkills.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💡</div>
          <h3 style={styles.emptyTitle}>No skills added yet</h3>
          <p style={styles.emptyText}>
            Click "Add Skill" to showcase your expertise!
          </p>
        </div>
      ) : (
        <div style={styles.categoriesContainer}>
          {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            <div key={category} style={styles.categoryCard}>
              <h3 style={styles.categoryTitle}>
                {categoryLabels[category]} ({categorySkills.length})
              </h3>
              <div style={styles.skillsGrid}>
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    style={styles.skillCard}
                  >
                    <div style={styles.skillContent}>
                      <div style={styles.skillName}>{skill.name}</div>
                      <div style={styles.skillMeta}>
                        <span 
                          style={{
                            ...styles.proficiencyBadge,
                            backgroundColor: proficiencyColors[skill.proficiency_level].bg,
                            color: proficiencyColors[skill.proficiency_level].text,
                          }}
                        >
                          {skill.proficiency_level}
                        </span>
                        {skill.years_of_experience && (
                          <span style={styles.yearsText}>
                            {skill.years_of_experience}y exp
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={styles.skillActions}>
                      <button
                        onClick={() => handleEdit(skill)}
                        style={styles.editButton}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        style={styles.deleteButton}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0',
  },
  subtitle: {
    color: '#6B7280',
    marginTop: '4px',
    fontSize: '14px',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#2563EB',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '32px',
    color: '#6B7280',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    border: '1px solid #FCA5A5',
    color: '#991B1B',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeError: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#991B1B',
    padding: '0 8px',
  },
  filterContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
    marginBottom: '24px',
  },
  filterButton: {
    padding: '8px 16px',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  filterButtonActive: {
    padding: '8px 16px',
    backgroundColor: '#2563EB',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E5E7EB',
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#111827',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    backgroundColor: 'white',
  },
  formActions: {
    display: 'flex',
    gap: '8px',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#2563EB',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#E5E7EB',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#6B7280',
    margin: '0 0 8px 0',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: '14px',
    margin: '0',
  },
  categoriesContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  categoryCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  categoryTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
    marginTop: '0',
  },
  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
  },
  skillCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  },
  skillContent: {
    flex: '1',
  },
  skillName: {
    fontWeight: '500',
    color: '#111827',
    marginBottom: '4px',
  },
  skillMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  },
  proficiencyBadge: {
    fontSize: '11px',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '500',
    textTransform: 'capitalize' as const,
  },
  yearsText: {
    fontSize: '12px',
    color: '#6B7280',
  },
  skillActions: {
    display: 'flex',
    gap: '4px',
  },
  editButton: {
    padding: '4px 8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    borderRadius: '4px',
  },
  deleteButton: {
    padding: '4px 8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    borderRadius: '4px',
  },
};

export default SkillsSection;
