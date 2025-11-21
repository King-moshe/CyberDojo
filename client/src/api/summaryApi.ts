import http from './httpClient';

export const getSummary = async (): Promise<any> => {
  const res = await http.get('/summary');
  return res.data || {};
};

export default { getSummary };
