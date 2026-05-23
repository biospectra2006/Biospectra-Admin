import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, Image, Settings, 
  Trash2, Upload, Loader2, 
  X
} from 'lucide-react';

const CertificatesTab = ({
  P,
  galleryImages,
  editingGallery,
  setEditingGallery,
  galleryData,
  setGalleryData,
  handleUploadGalleryImage,
  handleUpdateGalleryImage,
  handleDeleteGalleryImage,
  submitting
}) => {
  const [showModal, setShowModal] = React.useState(false);

  const certificates = galleryImages.filter(img => img.category === 'certificate');

  // Open modal if we start editing an image
  React.useEffect(() => {
    if (editingGallery) setShowModal(true);
  }, [editingGallery]);

  const closeModal = () => {
    setShowModal(false);
    setEditingGallery(null);
    setGalleryData({ title: '', description: '', category: 'certificate', order: 0, image: null });
  };

  return (
    <motion.div
      key="certificates-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
    >
      <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #f1f5f9', padding: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <div style={{ padding: '0.4rem', background: `${P.accent}15`, borderRadius: '0.65rem', color: P.accent }}><Award size={16} /></div>
               <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.1rem', color: '#0f172a', letterSpacing: '-0.02em' }}>Accreditations & Certificates</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', background: '#f8fafc', padding: '0.3rem 0.75rem', borderRadius: '2rem', border: '1px solid #f1f5f9' }}>{certificates.length} CERTIFICATES</span>
              <button 
                onClick={() => {
                  setGalleryData({ title: '', description: '', category: 'certificate', order: 0, image: null });
                  setShowModal(true);
                }}
                className="primary" 
                style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', fontWeight: 800, borderRadius: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Upload Certificate <Upload size={14} />
              </button>
            </div>
          </div>

          {certificates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'white', borderRadius: '1.25rem', border: '1px dashed #e2e8f0' }}>
              <div style={{ width: 60, height: 60, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#cbd5e1' }}>
                <Award size={24} />
              </div>
              <h4 style={{ margin: 0, color: '#1e293b', fontWeight: 900, fontSize: '0.9rem' }}>No Certificates Uploaded</h4>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Upload a certificate to display on the landing page.</p>
            </div>
          ) : (
            <div className="responsive-grid custom-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {certificates.map(img => (
                <motion.div 
                  key={img._id} 
                  whileHover={{ y: -5, boxShadow: '0 15px 35px -10px rgba(0,0,0,0.1)' }}
                  style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid #f1f5f9', background: 'white', transition: 'all 0.3s' }}
                >
                  <div style={{ position: 'relative', paddingTop: '130%', background: '#f8fafc' }}>
                    <img src={img.imageUrl} alt={img.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '0.5rem' }} />
                    <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.35rem' }}>
                      <button onClick={() => { setEditingGallery(img); setGalleryData({ title: img.title, description: img.description, category: img.category, order: img.order, image: null }); setShowModal(true); }} style={{ padding: '0.4rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer', display: 'flex', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', color: '#1e293b' }}><Settings size={12} /></button>
                      <button onClick={() => handleDeleteGalleryImage(img._id)} style={{ padding: '0.4rem', borderRadius: '0.6rem', background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer', display: 'flex', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', color: '#ef4444' }}><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <div style={{ padding: '0.65rem' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Asset Upload Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', 
          backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', 
          alignItems: 'center', justifyContent: 'center', padding: '1rem' 
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              background: 'white', borderRadius: '1.5rem', width: '100%', maxWidth: '400px', 
              padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' 
            }}
          >
            <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                  {editingGallery ? 'Update Certificate' : 'New Certificate'}
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                  {editingGallery ? 'Refining metadata for existing certificate.' : 'Upload a certificate to be displayed.'}
                </p>
              </div>
              <button 
                onClick={closeModal}
                style={{ border: 'none', background: '#f1f5f9', color: '#64748b', padding: '0.4rem', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (editingGallery) {
                await handleUpdateGalleryImage();
              } else {
                await handleUploadGalleryImage(e);
              }
              if (!submitting) closeModal();
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ marginBottom: '0.4rem', display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>CERTIFICATE TITLE</label>
                <input placeholder="e.g. SJIF Indexing 2024" value={galleryData.title} onChange={e => setGalleryData({...galleryData, title: e.target.value})} required style={{ padding: '0.75rem', borderRadius: '0.85rem', background: '#f8fafc', border: '1px solid #f1f5f9', fontWeight: 600, fontSize: '0.85rem' }} />
              </div>

              {!editingGallery && (
                <div>
                  <label style={{ marginBottom: '0.4rem', display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>CERTIFICATE IMAGE</label>
                  <div style={{ position: 'relative', background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '1rem', padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = P.accent} onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                    <input type="file" accept="image/*" style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} onChange={e => setGalleryData({...galleryData, image: e.target.files[0]})} required={!editingGallery} />
                    <div style={{ color: galleryData.image ? P.accent : '#cbd5e1', marginBottom: '0.4rem' }}><Upload size={18} /></div>
                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: galleryData.image ? P.accent : '#475569' }}>
                      {galleryData.image ? galleryData.image.name : 'Click to select certificate'}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="primary" type="submit" disabled={submitting} style={{ padding: '0.85rem', borderRadius: '1rem', fontWeight: 950, fontSize: '0.9rem', boxShadow: `0 10px 20px ${P.accent}20` }}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : editingGallery ? 'Update Certificate' : 'Upload Certificate'}
                </button>
                <button type="button" onClick={closeModal} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CertificatesTab;
