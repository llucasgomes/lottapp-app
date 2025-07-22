import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: "primary" | "secondary" | "outline";
    size?: "small" | "medium" | "large";
}

export default function Button({
    title,
    loading = false,
    variant = "primary",
    size = "large",
    disabled,
    ...props
}: ButtonProps) {
    const getButtonStyles = () => {
        const baseStyles = "rounded-xl items-center justify-center";

        // Size styles
        const sizeStyles = {
            small: "px-4 py-2",
            medium: "px-6 py-3",
            large: "px-6 py-4",
        };

        // Variant styles
        const variantStyles = {
            primary: disabled || loading ? "bg-gray-300" : "bg-black",
            secondary:
                disabled || loading
                    ? "bg-gray-100 border border-gray-200"
                    : "bg-gray-100 border border-gray-200",
            outline:
                disabled || loading
                    ? "bg-white border-2 border-gray-200"
                    : "bg-white border-2 border-black",
        };

        return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`;
    };

    const getTextStyles = () => {
        const baseStyles = "font-semibold";

        // Size styles
        const sizeStyles = {
            small: "text-sm",
            medium: "text-base",
            large: "text-base",
        };

        // Variant styles
        const variantStyles = {
            primary: disabled || loading ? "text-gray-500" : "text-white",
            secondary: disabled || loading ? "text-gray-400" : "text-gray-700",
            outline: disabled || loading ? "text-gray-400" : "text-black",
        };

        return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`;
    };

    return (
        <TouchableOpacity
            className={getButtonStyles()}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === "primary" ? "#ffffff" : "#666666"}
                />
            ) : (
                <Text className={getTextStyles()}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}
