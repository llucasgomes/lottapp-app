

import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import type { WebViewMessageEvent } from 'react-native-webview';
import { WebView } from 'react-native-webview';

type WebViewPaymentProps = {
  url: string;
  onSignIn?: () => void;
};

export default function WebViewPayment({ url, onSignIn }: WebViewPaymentProps) {
  const { push } = useRouter()
  interface HandleMessageEvent {
    nativeEvent: {
      data: string;
    };
  }

  const handleMessage = (event: WebViewMessageEvent | HandleMessageEvent): void => {
    const message: string = event.nativeEvent.data;

    if (message === 'voltar') push('/(auth)/sign-in');
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: `${url}` }}
        style={{ flex: 1 }}
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
