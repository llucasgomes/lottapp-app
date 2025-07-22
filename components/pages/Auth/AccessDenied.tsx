import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "~/components/ui/Button";


interface Props {
  portalUrl: string | null;
  onSignOut: () => Promise<void>;
}

export default function AccessDenied({ portalUrl, onSignOut }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await onSignOut();
      router.replace("/(auth)/sign-in");
    } catch (err) {
      console.error("Erro ao sair:", err);
      Alert.alert("Erro", "Não foi possível sair da conta.");
    }
  };

  return (
    <SafeAreaView className="flex-1 mt-9">
      <ScrollView className="px-6 " showsVerticalScrollIndicator={false}>
        <View className="items-center pt-16 pb-8">
          <View className="w-16 h-16 bg-black rounded-2xl items-center justify-center mb-6">
            <Ionicons name="bus" size={46} color="white" />
          </View>
          <Text className="text-2xl font-bold text-red-600 text-center mb-2">
            Assinatura Pendente
          </Text>
          <Text className="text-gray-600 text-center">
            Sua assinatura está inativa ou pendente. Para continuar, regularize seu acesso.
          </Text>
        </View>

        {/* Botão de Regularizar */}
        {portalUrl && (
          <Button
            title="Regularizar Assinatura"
            onPress={() => Linking.openURL(portalUrl)}
            className="mb-6"
          />
        )}

        {/* Link para sair */}
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-center text-blue-600 underline font-medium">
            Voltar para o início
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
