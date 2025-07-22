import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface SocialButtonProps {
    provider: "google" | "apple" | "facebook" | "github";
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
}

export default function SocialButton({
    provider,
    onPress,
    loading = false,
    disabled = false,
}: SocialButtonProps) {
    const getProviderConfig = () => {
        switch (provider) {
            case "google":
                return {
                    icon: "logo-google" as const,
                    iconColor: "#4285F4",
                    text: "Continue with Google",
                    bgColor: "bg-white",
                    borderColor: "border-gray-200",
                    textColor: "text-gray-700",
                };
            case "apple":
                return {
                    icon: "logo-apple" as const,
                    iconColor: "#000000",
                    text: "Sign in with Apple",
                    bgColor: "bg-white",
                    borderColor: "border-gray-200",
                    textColor: "text-gray-700",
                };
            case "facebook":
                return {
                    icon: "logo-facebook" as const,
                    iconColor: "#ffffff",
                    text: "Continue with Facebook",
                    bgColor: "bg-blue-600",
                    borderColor: "border-blue-600",
                    textColor: "text-white",
                };
            case "github":
                return {
                    icon: "logo-github" as const,
                    iconColor: "#333333",
                    text: "Continue with GitHub",
                    bgColor: "bg-white",
                    borderColor: "border-gray-200",
                    textColor: "text-gray-700",
                };
            default:
                return {
                    icon: "link-outline" as const,
                    iconColor: "#666666",
                    text: "Continue",
                    bgColor: "bg-white",
                    borderColor: "border-gray-200",
                    textColor: "text-gray-700",
                };
        }
    };

    const config = getProviderConfig();
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            className={`
        w-full flex-row items-center justify-center
        ${config.bgColor} border-2 ${config.borderColor}
        rounded-xl py-4 px-6 mb-3
        ${isDisabled ? "opacity-50" : ""}
      `}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={provider === "facebook" ? "#ffffff" : "#666666"}
                />
            ) : (
                <View className="flex-row items-center">
                    <Ionicons name={config.icon} size={20} color={config.iconColor} />
                    <Text className={`${config.textColor} font-medium text-base ml-3`}>
                        {config.text}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
