import { Ionicons } from "@expo/vector-icons";
import { forwardRef } from "react";
import {
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    containerClassName?: string;
}

export default forwardRef<TextInput, InputProps>(function Input(
    {
        label,
        error,
        leftIcon,
        rightIcon,
        onRightIconPress,
        containerClassName = "",
        ...props
    },
    ref
) {
    return (
        <View className={`mb-4 ${containerClassName}`}>
            {label && (
                <Text className="text-gray-800 text-base font-medium mb-1">
                    {label}
                </Text>
            )}
            <View className="relative">
                <View
                    className={`flex-row items-center bg-white border-2 rounded-xl px-4 py-2 ${error ? "border-red-400" : "border-gray-200"
                        }`}
                >
                    {leftIcon && (
                        <Ionicons
                            name={leftIcon}
                            size={20}
                            color={error ? "#f87171" : "#9ca3af"}
                            style={{ marginRight: 12 }}
                        />
                    )}
                    <TextInput
                        ref={ref}
                        className="flex-1 text-gray-900 text-base"
                        placeholderTextColor="#9ca3af"
                        {...props}
                    />
                    {rightIcon && (
                        <TouchableOpacity onPress={onRightIconPress} className="ml-3">
                            <Ionicons
                                name={rightIcon}
                                size={20}
                                color={error ? "#f87171" : "#9ca3af"}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            {error && <Text className="text-red-500 text-sm mt-2 ml-1">{error}</Text>}
        </View>
    );
});
