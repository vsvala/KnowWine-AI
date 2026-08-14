// Yksi axios.create()-instanssi, jota kaikki muut palvelut tuovat sisään sen sijaan että käyttäisivät suoraan axios-pakettia.
//Miksi: Axios-instanssiin voi liittää interceptoreita (pyyntö-/vastauskoukkuja), jotka ajetaan jokaiselle sen instanssin kautta kulkevalle pyynnölle automaattisesti. Jos tämä logiikka on yhdessä paikassa, jokainen palvelu saa refresh-käytöksen ilmaiseksi eikä sitä tarvitse kirjoittaa uudelleen myWines.ts:ään, users.ts:ään jne.
import axios from 'axios';

let accessToken: string | null = null;

const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const apiClient = axios.create({ baseURL: '/api' });
apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
    const { token } = await getRefreshedToken();
    original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      } catch (refreshError) {
        onAuthExpired?.();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const refreshAccessToken = async (): Promise<{ token: string; username: string; name: string; id: number }> => {
  const response = await axios.post<{ token: string; username: string; name: string; id: number }>('/api/login/refresh');
  const token = response.data.token;
  setAccessToken(token);
  return response.data as { token: string; username: string; name: string; id: number };
};
let refreshPromise: Promise<{ token: string; username: string; name: string; id: number }> | null = null;

// Dedupe concurrent refresh calls: if multiple requests 401 at once (e.g. React StrictMode's
// double effect run), they'd otherwise each trigger their own /refresh call. Caching the
// in-flight promise means every caller awaits the same request instead.
const getRefreshedToken = () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};
let onAuthExpired: (() => void) | null = null;

const setOnAuthExpired = (callback: () => void) => {
  onAuthExpired = callback;
};

export default { apiClient, getRefreshedToken,refreshAccessToken, setAccessToken, setOnAuthExpired };
