import { ActivityIndicator, Text, View } from "react-native";

export default function AuthLoading() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#007AFF" />
      <Text className="mt-3 text-base text-[#555]">Verificando acesso...</Text>
    </View>
  );
}
