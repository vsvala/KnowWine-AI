import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import wineListService from '../services/wineList';
import { useNotificationContext } from '../context/NotificationContext';

type WineList = {
  id: number;
  display_name: string;
  color: string;
  type: string;
  sub_type: string;
  residual_sugar: string | null;
  producer: object;
  region: string | null;
};
export const useWineList = () => {
  //const [wineList, setWineList] = useState<WineList[]>([]);
  const { showNotification } = useNotificationContext();

  const { data: wineList = [], error, isLoading } = useQuery<WineList[]>({
  queryKey: ['wines'],
  queryFn: wineListService.getAll,
  staleTime: 24 * 60 * 60 * 1000, // or even Infinity, given the 60-day Redis TTL
  });

  useEffect(() => {
        if (error) {
      showNotification('Unable to load wineList', 'error');
    }
     }, [error]); // eslint-disable-line react-hooks/exhaustive-deps
//TODO  wrap showNotification in useCallback inside useNotifications.ts
  return { wineList, isLoading };
};




//   useEffect(() => {
//     const fetchWines = async () => {
//       try {
//         const initialWineList = fetch("https:www/...) //await wineListService.getAll();
//         setWineList(initialWineList);
//       } catch {
//         setError('Unable to load wineList');
//       }
//     };
//     fetchWines();
//   }, []);

//   return { wineList, error };
// };


//   useEffect(() => {
//     //fetch('http://localhost:3001/api/wines')
//     wineListService
//       .getAll()
//       // .then((res) => res.json())
//       .then((initialWineList) => {
//         setWineList(initialWineList);
//       })
//       .catch(() => showNotification('Unable to load wineList', 'error'));
//     //console.error(err));
//   }, []);// eslint-disable-line react-hooks/exhaustive-deps

//   return { wineList };
// };