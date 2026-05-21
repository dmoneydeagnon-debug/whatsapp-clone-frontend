import { useEffect, useState } from 'react';
import ImageCropper from './ImageCropper';

const ProfileModal = ({
  open,
  user,
  form,
  setForm,
  onClose,
  onSave,
  loading
}) => {
  const [cropImage, setCropImage] = useState(null);

  useEffect(() => {
    if (open && user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
    }
  }, [open, user, setForm]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCropImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCropCancel = () => setCropImage(null);

  const handleCropComplete = (dataUrl) => {
    setForm((prev) => ({ ...prev, avatar: dataUrl }));
    setCropImage(null);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#0f172a',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          color: 'white'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '24px' }}>Edit Profile</h2>
            <p style={{ margin: '8px 0 0', color: '#94a3b8' }}>
              Update your name, contact details, and avatar.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #475569',
              color: 'white',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>
            Avatar
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '18px',
                overflow: 'hidden',
                background: '#1e2937',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt="Avatar preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: '#94a3b8' }}>No avatar</span>
              )}
            </div>

            <label
              style={{
                cursor: 'pointer',
                padding: '10px 16px',
                borderRadius: '9999px',
                background: '#1f2937',
                color: 'white',
                border: '1px solid #475569'
              }}
            >
              Change avatar
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {cropImage && (
          <ImageCropper
            imageSrc={cropImage}
            boxSize={240}
            onCancel={handleCropCancel}
            onCrop={handleCropComplete}
          />
        )}

        <form onSubmit={onSave}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <label style={{ display: 'block' }}>
              <span
                style={{
                  color: '#cbd5e1',
                  marginBottom: '8px',
                  display: 'inline-block'
                }}
              >
                Name
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#1e2937',
                  border: '1px solid #334155',
                  color: 'white'
                }}
              />
            </label>

            <label style={{ display: 'block' }}>
              <span
                style={{
                  color: '#cbd5e1',
                  marginBottom: '8px',
                  display: 'inline-block'
                }}
              >
                Email
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#1e2937',
                  border: '1px solid #334155',
                  color: 'white'
                }}
              />
            </label>

            <label style={{ display: 'block' }}>
              <span
                style={{
                  color: '#cbd5e1',
                  marginBottom: '8px',
                  display: 'inline-block'
                }}
              >
                Phone
              </span>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#1e2937',
                  border: '1px solid #334155',
                  color: 'white'
                }}
              />
            </label>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '28px'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                borderRadius: '9999px',
                border: '1px solid #475569',
                background: '#0f172a',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                borderRadius: '9999px',
                border: 'none',
                background: '#10b981',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;

