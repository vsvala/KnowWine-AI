import { useEffect, useState } from 'react';
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
  const [wineList, setWineList] = useState<WineList[]>([]);
  const { showNotification } = useNotificationContext();

  useEffect(() => {
    //fetch('http://localhost:3001/api/wines')
    wineListService
      .getAll()
      // .then((res) => res.json())
      .then((initialWineList) => {
        setWineList(initialWineList);
      })
      .catch(() => showNotification('Unable to load wineList', 'error'));
    //console.error(err));
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  return { wineList };
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