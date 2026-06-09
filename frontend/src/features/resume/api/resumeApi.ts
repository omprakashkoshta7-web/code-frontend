import api from '@/services/api';

export const resumeApi = {
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('resume', file);
    return api.post('/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 });
  },
  analyze: (resumeId?: string, text?: string) => api.post('/resume/analyze', { resume_id: resumeId, text }),
  list: () => api.get('/resume/list'),
  get: (id: string) => api.get(`/resume/${id}`),
  delete: (id: string) => api.delete(`/resume/${id}`),
  getTemplates: () => api.get('/resume/templates'),
  rewrite: (text: string) => api.post('/resume/rewrite', { text }),
};
