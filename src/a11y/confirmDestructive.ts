import { Alert } from 'react-native';

interface DestructiveConfirmation {
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onConfirm: () => void;
}

/** Native, screen-reader-friendly confirmation for irreversible actions. */
export function confirmDestructive({
  title,
  message,
  cancelLabel,
  confirmLabel,
  onConfirm,
}: DestructiveConfirmation) {
  Alert.alert(
    title,
    message,
    [
      { text: cancelLabel, style: 'cancel' },
      { text: confirmLabel, style: 'destructive', onPress: onConfirm },
    ],
    { cancelable: true },
  );
}
