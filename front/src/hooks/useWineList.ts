import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import wineListService from '../services/wineList';
import { useNotificationContext } from '../context/NotificationContext';
import type { Wine } from '../types/wine';

export const useWineList = () => {
  //const [wineList, setWineList] = useState<Wine[]>([]);
  const { showNotification } = useNotificationContext();
 console.log("useWinelist hook")
  const { data: wineList = [], error, isLoading } = useQuery<Wine[]>({
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