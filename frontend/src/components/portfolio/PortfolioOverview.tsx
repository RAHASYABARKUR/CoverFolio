import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Portfolio, PortfolioFormData } from '../../types/portfolio.types';
import portfolioService from '../../services/portfolio.service';

interface PortfolioOverviewProps {
  portfolio: Portfolio | null;
  onUpdate: () => void;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ portfolio, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [formData, setFormData] = useState<PortfolioFormData>({
    title: portfolio?.title || '',
    bio: portfolio?.bio || '',
    location: portfolio?.location || '',
    website: portfolio?.website || '',
    github: portfolio?.github || '',
    linkedin: portfolio?.linkedin || '',
    twitter: portfolio?.twitter || '',
    is_public: portfolio?.is_public || false,
  });

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Read file and show crop modal
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageToCrop(reader.result as string);
      setShowCropModal(true);
    });
    reader.readAsDataURL(file);
  };

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    setUploadingImage(true);
    setError(null);

    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'profile-image.jpg', { type: 'image/jpeg' });
      
      await portfolioService.uploadProfileImage(croppedFile);
      await onUpdate();
      alert('Profile picture updated successfully!');
      setShowCropModal(false);
      setImageToCrop(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload image');
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleDeleteProfileImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      await portfolioService.deleteProfileImage();
      await onUpdate();
      alert('Profile picture removed');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove image');
      alert('Failed to remove image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (portfolio) {
        await portfolioService.updatePortfolio(formData);
      } else {
        await portfolioService.createPortfolio(formData);
      }
      await onUpdate();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (portfolio) {
      setFormData({
        title: portfolio.title,
        bio: portfolio.bio,
        location: portfolio.location,
        website: portfolio.website,
        github: portfolio.github,
        linkedin: portfolio.linkedin,
        twitter: portfolio.twitter || '',
        is_public: portfolio.is_public,
      });
    }
    setIsEditing(true);
  };

  if (!portfolio && !isEditing) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📋</div>
        <h2 style={styles.emptyTitle}>Create Your Portfolio</h2>
        <p style={styles.emptyText}>
          Get started by creating your portfolio profile. Share your professional story with the
          world!
        </p>
        <button onClick={() => setIsEditing(true)} style={styles.createButton}>
          Create Portfolio
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <h2 style={styles.sectionTitle}>
          {portfolio ? 'Edit Portfolio' : 'Create Portfolio'}
        </h2>

        {error && (
          <div style={styles.errorMessage}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Professional Title <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Full Stack Developer"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Bio <span style={styles.required}>*</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              required
              rows={4}
              style={{ ...styles.input, ...styles.textarea }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Location <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., San Francisco, CA"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://yourwebsite.com"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>GitHub</label>
            <input
              type="url"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              placeholder="https://github.com/username"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>LinkedIn</label>
            <input
              type="url"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Twitter</label>
            <input
              type="url"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              placeholder="https://twitter.com/username"
              style={styles.input}
            />
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                style={styles.checkbox}
              />
              <span>Make portfolio public</span>
            </label>
            <p style={styles.helpText}>
              Public portfolios can be viewed by anyone with the link
            </p>
          </div>

          <div style={styles.buttonGroup}>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Saving...' : portfolio ? 'Update Portfolio' : 'Create Portfolio'}
            </button>
            {portfolio && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // This should never be null here due to the checks above, but TypeScript doesn't know that
  if (!portfolio) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.sectionTitle}>Portfolio Overview</h2>
        <button onClick={handleEdit} style={styles.editButton}>
          ✏️ Edit
        </button>
      </div>

      <div style={styles.profileCard}>
        <div style={styles.profileHeader}>
          <div style={styles.avatarContainer}>
            {portfolio.profile_image ? (
              <img 
                src={portfolio.profile_image} 
                alt={portfolio.user_name || portfolio.user_email}
                style={styles.profileImage}
                onClick={() => setShowImageModal(true)}
                title="Click to view full size"
              />
            ) : (
              <div style={styles.avatar}>{portfolio.user_name?.[0] || portfolio.user_email[0]}</div>
            )}
            <div style={styles.imageActions}>
              <label style={styles.uploadButton}>
                {uploadingImage ? '⏳' : '📷'} {portfolio.profile_image ? 'Change' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingImage}
                />
              </label>
              {portfolio.profile_image && (
                <button
                  onClick={handleDeleteProfileImage}
                  style={styles.deleteImageButton}
                  disabled={uploadingImage}
                  title="Remove profile picture"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
          <div>
            <h3 style={styles.profileName}>{portfolio.user_name || portfolio.user_email}</h3>
            <p style={styles.profileTitle}>{portfolio.title}</p>
          </div>
        </div>

        <div style={styles.bioSection}>
          <h4 style={styles.bioTitle}>About</h4>
          <p style={styles.bioText}>{portfolio.bio}</p>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>📍</span>
            <span style={styles.infoText}>{portfolio.location}</span>
          </div>

          {portfolio.website && (
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>🌐</span>
              <a href={portfolio.website} target="_blank" rel="noopener noreferrer" style={styles.link}>
                Website
              </a>
            </div>
          )}

          {portfolio.github && (
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>💻</span>
              <a href={portfolio.github} target="_blank" rel="noopener noreferrer" style={styles.link}>
                GitHub
              </a>
            </div>
          )}

          {portfolio.linkedin && (
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>💼</span>
              <a href={portfolio.linkedin} target="_blank" rel="noopener noreferrer" style={styles.link}>
                LinkedIn
              </a>
            </div>
          )}

          {portfolio.twitter && (
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>🐦</span>
              <a href={portfolio.twitter} target="_blank" rel="noopener noreferrer" style={styles.link}>
                Twitter
              </a>
            </div>
          )}
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{portfolio.projects_count || 0}</div>
            <div style={styles.statLabel}>Projects</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{portfolio.skills_count || 0}</div>
            <div style={styles.statLabel}>Skills</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{portfolio.experiences_count || 0}</div>
            <div style={styles.statLabel}>Experience</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{portfolio.education_count || 0}</div>
            <div style={styles.statLabel}>Education</div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {showImageModal && portfolio.profile_image && (
        <div style={styles.modalOverlay} onClick={() => setShowImageModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.modalCloseButton}
              onClick={() => setShowImageModal(false)}
              title="Close"
            >
              ✕
            </button>
            <img 
              src={portfolio.profile_image} 
              alt={portfolio.user_name || portfolio.user_email}
              style={styles.modalImage}
            />
            <div style={styles.modalCaption}>
              {portfolio.user_name || portfolio.user_email}
            </div>
          </div>
        </div>
      )}

      {showCropModal && imageToCrop && (
        <div style={styles.cropModalOverlay}>
          <div style={styles.cropModalContent}>
            <h3 style={styles.cropModalTitle}>Adjust Your Profile Picture</h3>
            <div style={styles.cropContainer}>
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div style={styles.cropControls}>
              <div style={styles.zoomControl}>
                <label style={styles.zoomLabel}>Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  style={styles.zoomSlider}
                />
              </div>
              <div style={styles.cropButtons}>
                <button 
                  style={styles.cropCancelButton} 
                  onClick={handleCropCancel}
                  disabled={uploadingImage}
                >
                  Cancel
                </button>
                <button 
                  style={styles.cropSaveButton} 
                  onClick={handleCropSave}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? '⏳ Uploading...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    paddingTop: '32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a202c',
    margin: 0,
  },
  editButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '64px 24px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '32px',
    maxWidth: '500px',
    margin: '0 auto 32px',
  },
  createButton: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  form: {
    maxWidth: '600px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '8px',
  },
  required: {
    color: '#e53e3e',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  checkboxGroup: {
    marginBottom: '24px',
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
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  helpText: {
    fontSize: '12px',
    color: '#718096',
    marginTop: '4px',
    marginLeft: '26px',
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
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    color: '#2d3748',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorMessage: {
    backgroundColor: '#fff5f5',
    border: '1px solid #fc8181',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#c53030',
    fontSize: '14px',
  },
  profileCard: {
    backgroundColor: '#f7fafc',
    borderRadius: '12px',
    padding: '32px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '32px',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  profileName: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 6px 0',
  },
  profileTitle: {
    fontSize: '16px',
    color: '#718096',
    margin: 0,
  },
  bioSection: {
    marginBottom: '32px',
  },
  bioTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '12px',
  },
  bioText: {
    fontSize: '15px',
    color: '#4a5568',
    lineHeight: '1.7',
    margin: 0,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  infoIcon: {
    fontSize: '18px',
  },
  infoText: {
    fontSize: '14px',
    color: '#4a5568',
  },
  link: {
    fontSize: '14px',
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '24px',
    marginTop: '32px',
    paddingTop: '32px',
    borderTop: '1px solid #e2e8f0',
  },
  statCard: {
    textAlign: 'center' as const,
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: '6px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#718096',
    fontWeight: '500',
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
  },
  profileImage: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '3px solid #667eea',
    cursor: 'pointer',
  },
  imageActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  uploadButton: {
    padding: '4px 12px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  deleteImageButton: {
    padding: '4px 8px',
    backgroundColor: '#FEE2E2',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    cursor: 'pointer',
  },
  modalContent: {
    position: 'relative' as const,
    maxWidth: '90vw',
    maxHeight: '90vh',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    cursor: 'default',
  },
  modalCloseButton: {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    fontSize: '20px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  modalImage: {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain' as const,
    borderRadius: '8px',
  },
  modalCaption: {
    textAlign: 'center' as const,
    marginTop: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a202c',
  },
  cropModalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  cropModalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    width: '90vw',
    maxWidth: '600px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
  },
  cropModalTitle: {
    margin: '0 0 16px 0',
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a202c',
    textAlign: 'center' as const,
  },
  cropContainer: {
    position: 'relative' as const,
    width: '100%',
    height: '400px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  cropControls: {
    marginTop: '20px',
  },
  zoomControl: {
    marginBottom: '20px',
  },
  zoomLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568',
  },
  zoomSlider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer',
  },
  cropButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cropCancelButton: {
    padding: '10px 24px',
    backgroundColor: '#e2e8f0',
    color: '#4a5568',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  cropSaveButton: {
    padding: '10px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
};

export default PortfolioOverview;
