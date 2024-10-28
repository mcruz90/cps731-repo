import { api } from './index';

export const financialService = {
  getReports: () => api.get('/legacy-php/generate_pdf.php'),
  getReportsV2: () => api.get('/api/v1/reports'),
  
};