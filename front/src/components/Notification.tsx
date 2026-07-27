import { Alert } from '@mui/material';


type NotificationProps = {
  notification: { text: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
};

const Notification = ({ notification }: NotificationProps) => {
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
