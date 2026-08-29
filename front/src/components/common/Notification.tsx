import { Alert } from '@mui/material';
import { useNotificationContext } from '../../context/NotificationContext';

const Notification = () => {
  const { notification } = useNotificationContext();
  if (notification === null) {
    return null;
  }

  return (
    <Alert style={{ marginTop: 10, marginBottom: 10 }} severity={notification.type}>
      {notification.text}
    </Alert>
  );
};

export default Notification;
