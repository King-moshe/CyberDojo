import useFetch from './useFetch';
import summaryApi from '../api/summaryApi';

export default function useSummary() {
  const { data, loading, error } = useFetch(() => summaryApi.getSummary(), []);
  return { summary: data, loading, error };
}
