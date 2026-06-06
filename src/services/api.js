import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];
let accessToken = null;

const setAccessToken = (token) => {
    accessToken = token;
};

const clearAccessToken = () => {
    accessToken = null;
};

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor: attach Bearer token if available
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401s and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        // ALSO: Don't try to refresh if the request was ALREADY to the refresh or login endpoints
        if (
            error.response && 
            error.response.status === 401 && 
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/refresh-token') &&
            !originalRequest.url.includes('/auth/login') &&
            !originalRequest.url.includes('/auth/logout') &&
            !originalRequest.url.includes('/auth/verify-mfa-stepup')
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(() => api(originalRequest))
                .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise((resolve, reject) => {
                api.post('/auth/refresh-token')
                    .then((response) => {
                        if (response.data.status === 'success') {
                            if (response.data.token) {
                                setAccessToken(response.data.token);
                            }
                            processQueue(null, null);
                            resolve(api(originalRequest));
                        } else {
                            processQueue(new Error('Refresh failed'), null);
                            reject(error);
                        }
                    })
                    .catch((err) => {
                        processQueue(err, null);
                        clearAccessToken();
                        localStorage.removeItem('spectra_admin_user');
                        window.location.href = '/';
                        reject(err);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }
        return Promise.reject(error);
    }
);

export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.status === 'success') {
        localStorage.setItem('spectra_admin_user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } catch {
        // Session may already be expired — ignore
    } finally {
        clearAccessToken();
        localStorage.removeItem('spectra_admin_user');
    }
};

export const getSessions = async () => {
    const response = await api.get('/auth/sessions');
    return response.data;
};

export const terminateSession = async (sessionId) => {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
};

export const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
};

export const loginMfa = async (userId, token) => {
    const response = await api.post('/auth/login-mfa', { userId, token });
    if (response.data.user) {
        localStorage.setItem('spectra_admin_user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const getMfaSetup = async () => {
    try {
        const response = await api.get('/auth/mfa-setup');
        return response.data;
    } catch (error) {
        console.error('API Error (MFA Setup):', error.response || error);
        throw error;
    }
};

export const verifyMfaSetup = async (token) => {
    const response = await api.post('/auth/mfa-verify', { token });
    return response.data;
};

export const verifyMfaStepup = async (token) => {
    const response = await api.post('/auth/verify-mfa-stepup', { token });
    return response.data;
};

export const getJournalTree = async () => {
    const response = await api.get('/articles/tree');
    return response.data;
};

export const createYear = async (year) => {
    const response = await api.post('/articles/init-year', { year });
    return response.data;
};

export const createCategory = async (issueId, title) => {
    const response = await api.post('/articles/category', { issueId, title });
    return response.data;
};

export const uploadArticle = async (formData) => {
    const response = await api.post('/articles/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const extractPdf = async (formData) => {
    const response = await api.post('/articles/extract-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const refetchPdfMetadata = async (id) => {
    const response = await api.post(`/articles/${id}/refetch-metadata`);
    return response.data;
};

export const deleteArticle = async (id) => {
    const response = await api.delete(`/articles/${id}`);
    return response.data;
};

export const updateArticle = async (id, data) => {
    const response = await api.put(`/articles/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await api.delete(`/articles/category/${id}`);
    return response.data;
};

export const deleteYear = async (id) => {
    const response = await api.delete(`/articles/year/${id}`);
    return response.data;
};

export const createIssue = async (yearId, title) => {
    const response = await api.post('/articles/issue', { yearId, title });
    return response.data;
};

export const deleteIssue = async (id) => {
    const response = await api.delete(`/articles/issue/${id}`);
    return response.data;
};

export const updateIssue = async (id, data) => {
    const response = await api.put(`/articles/issue/${id}`, data);
    return response.data;
};

// About APIs
export const getAboutSections = async () => {
    const response = await api.get('/about');
    return response.data;
};
export const createAboutSection = async (data) => {
    const response = await api.post('/about', data);
    return response.data;
};
export const updateAboutSection = async (id, data) => {
    const response = await api.put(`/about/${id}`, data);
    return response.data;
};
export const deleteAboutSection = async (id) => {
    const response = await api.delete(`/about/${id}`);
    return response.data;
};

// Editorial APIs
export const getEditorialMembers = async () => {
    const response = await api.get('/editorial');
    return response.data;
};
export const createEditorialMember = async (data) => {
    const response = await api.post('/editorial', data);
    return response.data;
};
export const updateEditorialMember = async (id, data) => {
    const response = await api.put(`/editorial/${id}`, data);
    return response.data;
};
export const deleteEditorialMember = async (id) => {
    const response = await api.delete(`/editorial/${id}`);
    return response.data;
};

// Gallery APIs
export const getGalleryImages = async () => {
    const response = await api.get('/gallery');
    return response.data;
};
export const uploadGalleryImage = async (formData) => {
    const response = await api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};
export const updateGalleryImage = async (id, data) => {
    const response = await api.put(`/gallery/${id}`, data);
    return response.data;
};
export const deleteGalleryImage = async (id) => {
    const response = await api.delete(`/gallery/${id}`);
    return response.data;
};

export default api;
