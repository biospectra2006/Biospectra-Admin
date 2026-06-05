import React, { useState, useEffect, useMemo } from 'react';
import './index.css';
import { 
  Plus, FileText, 
  Layers, CheckCircle, Loader2, Search, 
  Trash2, ExternalLink, Calendar, BookOpen, 
  ArrowRight, Globe,
  ChevronRight, FolderOpen, Target, LayoutDashboard,
  Library, Settings, Clock, AlertCircle,
  Activity, Layout, Zap, Book, Folder,
  Camera, QrCode, ShieldCheck as Shield, Pencil, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getJournalTree, 
  createYear, 
  createIssue,
  createCategory, 
  deleteCategory,
  uploadArticle, 
  extractPdf,
  deleteArticle,
  updateArticle,
  getAboutSections,
  createAboutSection,
  updateAboutSection,
  deleteAboutSection,
  getEditorialMembers,
  createEditorialMember,
  updateEditorialMember,
  deleteEditorialMember,
  getGalleryImages,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  deleteYear,
  deleteIssue,
  updateIssue,
  getMfaSetup,
  verifyMfaSetup,
  getMe,
  logout as apiLogout
} from './services/api';
import Login from './Login';
import AnalyticsTab from './components/tabs/AnalyticsTab';
import PublishTab from './components/tabs/PublishTab';
import ExploreTab from './components/tabs/ExploreTab';
import AboutTab from './components/tabs/AboutTab';
import EditorialTab from './components/tabs/EditorialTab';
import GalleryTab from './components/tabs/GalleryTab';
import SecurityTab from './components/tabs/SecurityTab';
import AuditTab from './components/tabs/AuditTab';
import MfaModal from './components/MfaModal';
import AdminLayout from './components/layout/AdminLayout';

function App() {
  const [journalTree, setJournalTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [health, setHealth] = useState({ db: 'CHECKING', cloudinary: 'OK' });
  const [activeTab, setActiveTab] = useState('analytics');
  const [mfaModal, setMfaModal] = useState({ isOpen: false, onResolve: null });

  // Handle auth state on mount (Google OAuth redirect or page reload)
  useEffect(() => {
    const initAuth = async () => {
      setAuthLoading(true);
      const params = new URLSearchParams(window.location.search);

      // Google OAuth callback - cookies already set by server
      if (params.get('auth') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
        try {
          const user = await getMe();
          localStorage.setItem('spectra_admin_user', JSON.stringify(user));
          setIsAuthenticated(true);
        } catch {
          setIsAuthenticated(false);
        }
        setAuthLoading(false);
        return;
      }

      // Normal reload - verify existing session via cookies
      if (localStorage.getItem('spectra_admin_user')) {
        try {
          const user = await getMe();
          localStorage.setItem('spectra_admin_user', JSON.stringify(user));
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('spectra_admin_user');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setAuthLoading(false);
    };

    initAuth();
  }, []);

  // Centralized Theme Palette
  const P = {
    primary: '#133215',    // Brand Dark Green
    primaryDark: '#0d240e',
    secondary: '#92B775',  // Brand Lime Green
    accent: '#92B775',
    error: '#ef4444',
    bg: '#eef4ec',         // Brand Light Green
    white: '#ffffff',
    text: '#133215',
    textMuted: 'rgba(19, 50, 21, 0.6)',
    border: 'rgba(19, 50, 21, 0.1)'
  };

  const [mfaVerifiedAt, setMfaVerifiedAt] = useState(null);

  const isElevated = useMemo(() => {
    if (!mfaVerifiedAt) return false;
    const diff = Date.now() - mfaVerifiedAt;
    return diff < 60 * 60 * 1000; // 60 minutes
  }, [mfaVerifiedAt]);

  const handleLogout = () => {
    showConfirm(
      'Confirm Logout',
      'Are you sure you want to end your administrative session?',
      async () => {
        await apiLogout();
        setIsAuthenticated(false);
        window.location.href = '/';
      }
    );
  };

  // Helper to handle MFA Step-up Challenges
  const withMfa = (action) => {
    return new Promise((resolve, reject) => {
      action().then(resolve).catch(reject);
    });
  };

  // Active Context States (The Flow)
  const [activeYear, setActiveYear] = useState(null);
  const [activeIssue, setActiveIssue] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  // Search/Filter states for Explorer
  const [explorerSearch, setExplorerSearch] = useState('');

  // Input States
  const [newYearInput, setNewYearInput] = useState('');
  const [newIssueInput, setNewIssueInput] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  
  const [articleData, setArticleData] = useState({
    title: '',
    authors: '',
    abstract: '',
    keywords: '',
    doi: '',
    pages: '',
    affiliation: '',
    file: null
  });

  // NEW: About & Editorial States
  const [aboutSections, setAboutSections] = useState([]);
  const [editorialMembers, setEditorialMembers] = useState([]);
  const [editingAbout, setEditingAbout] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  
  const [newAboutData, setNewAboutData] = useState({ title: '', content: '', sectionType: 'history', order: 0 });
  const [newMemberData, setNewMemberData] = useState({ name: '', role: '', email: '', department: '', location: '', memberType: 'core', order: 0 });

  const [memberSearch, setMemberSearch] = useState('');

  // Gallery States
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryData, setGalleryData] = useState({ title: '', description: '', category: 'general', order: 0, image: null });
  const [editingGallery, setEditingGallery] = useState(null);

  // Modal State
  const [modal, setModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: null,
    isAlert: false,
    isPrompt: false,
    promptValue: ''
  });
  const [editingArticle, setEditingArticle] = useState(null);
  const [publishStep, setPublishStep] = useState(1); // 1: Context, 2: Metadata, 3: Finalize

  // MFA Setup State
  const [mfaQrCode, setMfaQrCode] = useState(null);
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaSetupToken, setMfaSetupToken] = useState('');

  const [isDeleting, setIsDeleting] = useState(false);

  const showConfirm = (title, message, onConfirm) => {
    setModal({ isOpen: true, title, message, onConfirm, isAlert: false, isPrompt: false });
  };

  const showAlert = (title, message) => {
    setModal({ isOpen: true, title, message, onConfirm: () => setModal({ ...modal, isOpen: false }), isAlert: true, isPrompt: false });
  };

  const showPrompt = (title, message, initialValue, onConfirm) => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      isAlert: false,
      isPrompt: true,
      promptValue: initialValue
    });
  };

  useEffect(() => {
    fetchData();
    fetchAboutData();
    fetchEditorialData();
    fetchGalleryData();
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAboutData = async () => {
    try {
      const data = await getAboutSections();
      setAboutSections(data);
    } catch (error) {
      console.error('About data error:', error);
    }
  };

  const fetchEditorialData = async () => {
    try {
      const data = await getEditorialMembers();
      setEditorialMembers(data);
    } catch (error) {
      console.error('Editorial data error:', error);
    }
  };

  const fetchGalleryData = async () => {
    try {
      const data = await getGalleryImages();
      setGalleryImages(data);
    } catch (error) {
      console.error('Gallery data error:', error);
    }
  };

  const checkHealth = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/health`);
      const data = await response.json();
      setHealth({ db: data.database, cloudinary: 'OK' });
    } catch (error) {
      setHealth({ db: 'OFFLINE', cloudinary: 'OFFLINE' });
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching Journal Tree...');
      const data = await getJournalTree();
      console.log('Data Received:', data);
      setJournalTree(data);
      
      // Update active references to fresh objects from the new data
      if (activeYear) {
        const freshYear = data.find(y => y._id === activeYear._id);
        if (freshYear) {
          setActiveYear(freshYear);
          if (activeIssue) {
            const freshIssue = freshYear.issues.find(i => i._id === activeIssue._id);
            if (freshIssue) {
              setActiveIssue(freshIssue);
              if (activeCategory) {
                const freshCat = freshIssue.categories.find(c => c._id === activeCategory._id);
                if (freshCat) setActiveCategory(freshCat);
              }
            }
          }
        }
      } else if (data.length > 0) {
        setActiveYear(data[0]);
      }
    } catch (error) {
      console.error('Error fetching tree:', error);
      showAlert('Sync Failed', 'Database connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateYear = async (e) => {
    e.preventDefault();
    if (!newYearInput) return;
    setSubmitting(true);
    try {
      await withMfa(() => createYear(parseInt(newYearInput)));
      setNewYearInput('');
      await fetchData();
    } catch (error) {
      if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
      showAlert('Error', error.response?.data?.message || 'Year already exists or server error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!activeYear || !newIssueInput) return;
    setSubmitting(true);
    try {
      await withMfa(() => createIssue(activeYear._id, newIssueInput));
      setNewIssueInput('');
      await fetchData();
    } catch (error) {
      if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
      showAlert('Error', error.response?.data?.message || 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!activeIssue || !newCategoryInput) return;
    setSubmitting(true);
    try {
      await withMfa(() => createCategory(activeIssue._id, newCategoryInput));
      setNewCategoryInput('');
      await fetchData();
    } catch (error) {
      if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
      const msg = error.response?.data?.message || error.message || 'Failed to create section';
      showAlert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadArticle = async (e) => {
    e.preventDefault();
    if (!activeCategory) return showAlert('Action Required', 'Please select a specific Section first');
    
    setSubmitting(true);
    setUploadStatus('');
    
    try {
      if (editingArticle) {
        setUploadStatus('Updating article metadata...');
        await withMfa(() => updateArticle(editingArticle._id, {
          title: articleData.title,
          authors: articleData.authors,
          abstract: articleData.abstract,
          keywords: articleData.keywords,
          doi: articleData.doi,
          pages: articleData.pages,
          affiliation: articleData.affiliation,
          categoryId: activeCategory._id
        }));
        showAlert('Success', 'Article metadata updated!');
        setEditingArticle(null);
      } else {
        // Handle New Upload
        if (!articleData.file) {
          setSubmitting(false);
          setUploadStatus('');
          return showAlert('Required', 'Please select a PDF file to upload.');
        }
        const formData = new FormData();
        formData.append('title', articleData.title);
        formData.append('authors', articleData.authors);
        formData.append('abstract', articleData.abstract);
        formData.append('keywords', articleData.keywords);
        formData.append('doi', articleData.doi);
        formData.append('pages', articleData.pages);
        formData.append('affiliation', articleData.affiliation);
        formData.append('categoryId', activeCategory._id);
        formData.append('file', articleData.file);
        setUploadStatus('Uploading PDF to Cloudinary...');
        await withMfa(() => uploadArticle(formData));
        showAlert('Success', 'Article published successfully!');
      }
      
      setArticleData({ title: '', authors: '', abstract: '', keywords: '', doi: '', pages: '', affiliation: '', file: null });
      setUploadStatus('Refreshing journal tree...');
      await fetchData();
    } catch (error) {
      if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
      showAlert('Operation Failed', error.response?.data?.message || 'There was an error processing your article.');
    } finally {
      setSubmitting(false);
      setUploadStatus('');
    }
  };

  const handleExtractPdf = async (file) => {
    if (!file) return;
    setSubmitting(true);
    setUploadStatus('Analyzing PDF structure...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await withMfa(() => extractPdf(formData));
      if (res.status === 'success' && res.data) {
        const d = res.data;
        setArticleData(prev => ({
          ...prev,
          title: d.title || prev.title,
          authors: d.authors || prev.authors,
          affiliation: d.affiliation || prev.affiliation,
          abstract: d.abstract || prev.abstract,
          keywords: d.keywords || prev.keywords,
          doi: d.doi || prev.doi,
          pages: d.pages || prev.pages,
          file: file
        }));
        showAlert('Auto-Fill Success', 'Title, authors, abstract, keywords, and pages have been automatically extracted from this PDF!');
      }
    } catch (error) {
      if (error.message === 'MFA_CANCELLED') return;
      showAlert('Auto-Fill Failed', error.response?.data?.message || 'Could not parse metadata from this PDF. Please enter manually.');
    } finally {
      setSubmitting(false);
      setUploadStatus('');
    }
  };

  const handleDeleteArticle = async (id) => {
    showConfirm('Delete Article', 'Are you sure you want to permanently delete this article?', async () => {
      try {
        await withMfa(() => deleteArticle(id));
        await fetchData();
      } catch (error) {
        if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
        showAlert('Error', 'Failed to delete article');
      }
    });
  };

  const handleDeleteCategory = async (id, title) => {
    showConfirm(
      'Delete Section', 
      `Are you sure you want to delete the "${title}" section? This will also permanently delete ALL articles inside it.`, 
      async () => {
        try {
          await withMfa(() => deleteCategory(id));
          setActiveCategory(null);
          await fetchData();
        } catch (error) {
          if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
          showAlert('Error', 'Failed to delete section');
        }
      }
    );
  };

  const handleDeleteYear = async (id, year) => {
    console.log('Initiating delete for year:', year, 'ID:', id);
    showConfirm(
      'Delete Volume', 
      `Are you sure you want to delete the Year ${year}? This will permanently delete ALL issues, sections, and articles inside it, including Cloudinary files.`, 
      async () => {
        try {
          console.log('Confirming delete for Year ID:', id);
          await withMfa(() => deleteYear(id));
          console.log('Delete successful');
          setActiveYear(null);
          await fetchData();
          showAlert('Success', `Volume ${year} deleted successfully.`);
        } catch (error) {
          if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
          console.error('Delete Year Error:', error);
          showAlert('Error', 'Failed to delete volume: ' + (error.response?.data?.message || error.message));
        }
      }
    );
  };

  const handleDeleteIssue = async (id, title) => {
    showConfirm(
      'Delete Issue', 
      `Are you sure you want to delete ${title}? This will permanently delete all sections and articles inside it, including files.`, 
      async () => {
        try {
          await withMfa(() => deleteIssue(id));
          setActiveIssue(null);
          await fetchData();
          showAlert('Success', `Issue ${title} deleted successfully.`);
        } catch (error) {
          if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
          console.error('Delete Issue Error:', error);
          showAlert('Error', 'Failed to delete issue: ' + (error.response?.data?.message || error.message));
        }
      }
    );
  };

  const handleEditIssue = async (id, currentTitle) => {
    showPrompt('Edit Issue Title', 'Enter new title for this issue:', currentTitle, async (newTitle) => {
      if (!newTitle || newTitle === currentTitle) return;
      try {
        await withMfa(() => updateIssue(id, { title: newTitle }));
        await fetchData();
        showAlert('Success', `Issue updated successfully.`);
      } catch (error) {
        if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
        console.error('Edit Issue Error:', error);
        showAlert('Error', 'Failed to edit issue: ' + (error.response?.data?.message || error.message));
      }
    });
  };

  // Drag and Drop Handlers
  const onDragStart = (e, articleId) => {
    e.dataTransfer.setData('articleId', articleId);
    e.currentTarget.style.opacity = '0.4';
  };

  const onDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.background = '#ecfdf5';
    e.currentTarget.style.borderColor = 'P.accent';
  };

  const onDragLeave = (e) => {
    e.currentTarget.style.background = '#f8fafc';
    e.currentTarget.style.borderColor = '#f1f5f9';
  };

  const onDrop = async (e, targetCategoryId) => {
    e.preventDefault();
    const articleId = e.dataTransfer.getData('articleId');
    
    // Reset styles
    e.currentTarget.style.background = '#f8fafc';
    e.currentTarget.style.borderColor = '#f1f5f9';

    if (!articleId) return;

    try {
      await withMfa(() => updateArticle(articleId, { categoryId: targetCategoryId }));
      await fetchData();
    } catch (error) {
      if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
      showAlert('Error', 'Failed to move article');
    }
  };

  // About Handlers
  const handleSaveAbout = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAbout && editingAbout._id) {
        await withMfa(() => updateAboutSection(editingAbout._id, newAboutData));
      } else {
        await withMfa(() => createAboutSection(newAboutData));
      }
      setNewAboutData({ title: '', content: '', sectionType: 'history', order: 0 });
      setEditingAbout(null);
      await fetchAboutData();
    } catch (error) {
      if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
      showAlert('Error', 'Failed to save about section');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAbout = async (id) => {
    showConfirm('Delete Section', 'Remove this about section?', async () => {
      try {
        await withMfa(() => deleteAboutSection(id));
        await fetchAboutData();
      } catch (error) {
        if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
        showAlert('Error', 'Delete failed');
      }
    });
  };

  // Editorial Handlers
  const handleSaveMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingMember) {
        await withMfa(() => updateEditorialMember(editingMember._id, newMemberData));
      } else {
        await withMfa(() => createEditorialMember(newMemberData));
      }
      setNewMemberData({ name: '', role: '', email: '', department: '', location: '', memberType: 'core', order: 0 });
      setEditingMember(null);
      await fetchEditorialData();
    } catch (error) {
      if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
      showAlert('Error', 'Failed to save member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (id) => {
    showConfirm('Delete Member', 'Are you sure you want to remove this member from the editorial board?', async () => {
      try {
        await withMfa(() => deleteEditorialMember(id));
        await fetchEditorialData();
      } catch (error) {
        if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
        showAlert('Error', 'Delete failed');
      }
    });
  };

  // Gallery Handlers
  const handleUploadGalleryImage = async (e) => {
    e.preventDefault();
    if (!galleryData.image) return showAlert('Required', 'Please select an image file');
    setSubmitting(true);
    const formData = new FormData();
    formData.append('image', galleryData.image);
    formData.append('title', galleryData.title);
    formData.append('description', galleryData.description);
    formData.append('category', galleryData.category);
    formData.append('order', galleryData.order);
    try {
      await withMfa(() => uploadGalleryImage(formData));
      setGalleryData({ title: '', description: '', category: 'general', order: 0, image: null });
      await fetchGalleryData();
      showAlert('Success', 'Image uploaded and compressed!');
    } catch (error) {
      if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
      showAlert('Upload Failed', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateGalleryImage = async () => {
    if (!editingGallery) return;
    setSubmitting(true);
    try {
      await withMfa(() => updateGalleryImage(editingGallery._id, {
        title: galleryData.title,
        description: galleryData.description,
        category: galleryData.category,
        order: galleryData.order,
      }));
      setEditingGallery(null);
      setGalleryData({ title: '', description: '', category: 'general', order: 0, image: null });
      await fetchGalleryData();
    } catch (error) {
      if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
      showAlert('Error', 'Failed to update image info');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetupMfa = async () => {
    setSubmitting(true);
    try {
      const data = await getMfaSetup();
      setMfaQrCode(data.qrCode);
      setMfaSecret(data.secret);
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'Failed to generate MFA secret');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyMfaSetup = async () => {
    if (!mfaSetupToken) return;
    setSubmitting(true);
    try {
      await verifyMfaSetup(mfaSetupToken);
      showAlert('Success', 'MFA has been enabled. Sensitive actions (like deleting or uploading) will now require a verification code for maximum security.');
      setMfaQrCode(null);
      setMfaSetupToken('');
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeleteGalleryImage = async (id) => {
    showConfirm('Delete Image', 'This will permanently remove the image from the gallery.', async () => {
      try {
        await withMfa(() => deleteGalleryImage(id));
        await fetchGalleryData();
      } catch (error) {
        if (error.message === 'MFA_CANCELLED') return showAlert('Cancelled', 'Security challenge was aborted.');
        showAlert('Error', 'Delete failed');
      }
    });
  };

  const currentYearData = useMemo(() => 
    journalTree.find(y => y._id === activeYear?._id), 
  [journalTree, activeYear]);

  const currentIssueData = useMemo(() => 
    currentYearData?.issues.find(i => i._id === activeIssue?._id),
  [currentYearData, activeIssue]);

  const currentCategoryData = useMemo(() => 
    currentIssueData?.categories.find(c => c._id === activeCategory?._id),
  [currentIssueData, activeCategory]);

  const totalArticlesCount = useMemo(() => {
    return journalTree.reduce((acc, y) => acc + y.issues.reduce((iAcc, i) => iAcc + i.categories.reduce((cAcc, c) => cAcc + c.articles.length, 0), 0), 0);
  }, [journalTree]);

  const totalIssuesCount = useMemo(() => {
    return journalTree.reduce((acc, y) => acc + y.issues.length, 0);
  }, [journalTree]);

  const totalSectionsCount = useMemo(() => {
    return journalTree.reduce((acc, y) => acc + y.issues.reduce((iAcc, i) => iAcc + i.categories.length, 0), 0);
  }, [journalTree]);

  return (
    <>
      {authLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#eef4ec' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={40} className="animate-spin" color="#133215" />
            <p style={{ marginTop: '1rem', color: '#133215', fontWeight: 600 }}>Verifying session...</p>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
      <AdminLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        totalArticlesCount={totalArticlesCount}
        totalIssuesCount={totalIssuesCount}
        syncData={fetchData}
        P={P}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' ? (
            <AnalyticsTab 
              P={P} 
              journalTree={journalTree} 
              totalIssuesCount={totalIssuesCount}
              totalSectionsCount={totalSectionsCount}
              totalArticlesCount={totalArticlesCount}
            />
          ) : activeTab === 'publish' ? (
            <PublishTab 
              P={P}
              publishStep={publishStep}
              setPublishStep={setPublishStep}
              activeYear={activeYear}
              setActiveYear={setActiveYear}
              activeIssue={activeIssue}
              setActiveIssue={setActiveIssue}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              journalTree={journalTree}
              currentYearData={currentYearData}
              currentIssueData={currentIssueData}
              newYearInput={newYearInput}
              setNewYearInput={setNewYearInput}
              newIssueInput={newIssueInput}
              setNewIssueInput={setNewIssueInput}
              newCategoryInput={newCategoryInput}
              setNewCategoryInput={setNewCategoryInput}
              handleCreateYear={handleCreateYear}
              handleCreateIssue={handleCreateIssue}
              handleEditIssue={handleEditIssue}
              handleDeleteIssue={handleDeleteIssue}
              handleCreateCategory={handleCreateCategory}
              handleUploadArticle={handleUploadArticle}
              handleExtractPdf={handleExtractPdf}
              articleData={articleData}
              setArticleData={setArticleData}
              submitting={submitting}
              uploadStatus={uploadStatus}
              editingArticle={editingArticle}
              setEditingArticle={setEditingArticle}
              isElevated={isElevated}
            />
          ) : activeTab === 'about' ? (
            <AboutTab 
              P={P}
              aboutSections={aboutSections}
              editingAbout={editingAbout}
              setEditingAbout={setEditingAbout}
              newAboutData={newAboutData}
              setNewAboutData={setNewAboutData}
              handleSaveAbout={handleSaveAbout}
              handleDeleteAbout={handleDeleteAbout}
              submitting={submitting}
            />
          ) : activeTab === 'editorial' ? (
            <EditorialTab 
              P={P}
              editorialMembers={editorialMembers}
              editingMember={editingMember}
              setEditingMember={setEditingMember}
              newMemberData={newMemberData}
              setNewMemberData={setNewMemberData}
              handleSaveMember={handleSaveMember}
              handleDeleteMember={handleDeleteMember}
              memberSearch={memberSearch}
              setMemberSearch={setMemberSearch}
              submitting={submitting}
            />
          ) : activeTab === 'explore' ? (
            <ExploreTab 
              P={P}
              journalTree={journalTree}
              activeYear={activeYear}
              setActiveYear={setActiveYear}
              activeIssue={activeIssue}
              setActiveIssue={setActiveIssue}
              setActiveCategory={setActiveCategory}
              currentYearData={currentYearData}
              currentIssueData={currentIssueData}
              explorerSearch={explorerSearch}
              setExplorerSearch={setExplorerSearch}
              handleDeleteYear={handleDeleteYear}
              handleDeleteIssue={handleDeleteIssue}
              handleEditIssue={handleEditIssue}
              handleDeleteCategory={handleDeleteCategory}
              handleDeleteArticle={handleDeleteArticle}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              setEditingArticle={setEditingArticle}
              setArticleData={setArticleData}
              setActiveTab={setActiveTab}
              setPublishStep={setPublishStep}
            />
          ) : activeTab === 'gallery' ? (
            <GalleryTab 
              P={P}
              galleryImages={galleryImages}
              editingGallery={editingGallery}
              setEditingGallery={setEditingGallery}
              galleryData={galleryData}
              setGalleryData={setGalleryData}
              handleUploadGalleryImage={handleUploadGalleryImage}
              handleUpdateGalleryImage={handleUpdateGalleryImage}
              handleDeleteGalleryImage={handleDeleteGalleryImage}
              submitting={submitting}
            />
          ) : activeTab === 'security' ? (
            <SecurityTab 
              P={P}
              mfaQrCode={mfaQrCode}
              setMfaQrCode={setMfaQrCode}
              mfaSetupToken={mfaSetupToken}
              setMfaSetupToken={setMfaSetupToken}
              handleSetupMfa={handleSetupMfa}
              handleVerifyMfaSetup={handleVerifyMfaSetup}
              submitting={submitting}
            />
          ) : activeTab === 'audit' ? (
            <AuditTab P={P} />
          ) : null}

        </AnimatePresence>
      </AdminLayout>
      )}


      {/* Modal Overlay */}
      <AnimatePresence>
        {modal.isOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModal({ ...modal, isOpen: false })}
              style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ position: 'relative', width: '100%', maxWidth: '400px', background: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #f1f5f9' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: modal.isAlert ? '#fef3c7' : '#fee2e2', padding: '0.5rem', borderRadius: '0.75rem' }}>
                  <AlertCircle size={20} color={modal.isAlert ? '#d97706' : '#ef4444'} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{modal.title}</h3>
              </div>
              <p style={{ margin: modal.isPrompt ? '0 0 1rem 0' : '0 0 2rem 0', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>{modal.message}</p>
              {modal.isPrompt && (
                <input 
                  type="text" 
                  value={modal.promptValue} 
                  onChange={(e) => setModal({ ...modal, promptValue: e.target.value })} 
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '2px solid #e2e8f0', marginBottom: '2rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = '#1e40af'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  autoFocus
                />
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                {!modal.isAlert && (
                  <button 
                    onClick={() => setModal({ ...modal, isOpen: false })}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={async () => { 
                    if (modal.onConfirm) {
                      setIsDeleting(true);
                      try {
                        await modal.onConfirm(modal.isPrompt ? modal.promptValue : undefined);
                      } finally {
                        setIsDeleting(false);
                        setModal({ ...modal, isOpen: false }); 
                      }
                    } else {
                      setModal({ ...modal, isOpen: false }); 
                    }
                  }}
                  disabled={isDeleting}
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '1rem', 
                    border: 'none', 
                    background: modal.isAlert ? '#0f172a' : (modal.isPrompt ? '#1e40af' : '#ef4444'), 
                    color: 'white', 
                    fontWeight: 800, 
                    cursor: isDeleting ? 'not-allowed' : 'pointer', 
                    fontSize: '0.8rem',
                    opacity: isDeleting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {modal.isPrompt ? 'Saving...' : 'Deleting...'}
                    </>
                  ) : (
                    modal.isAlert ? 'Got it' : (modal.isPrompt ? 'Save Changes' : 'Confirm Action')
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <MfaModal 
        isOpen={mfaModal.isOpen} 
        onClose={() => {
          if (mfaModal.onReject) {
            mfaModal.onReject();
          } else {
            setMfaModal({ ...mfaModal, isOpen: false });
          }
        }}
        onSuccess={mfaModal.onResolve}
      />
    </>
  );
}

export default App;
