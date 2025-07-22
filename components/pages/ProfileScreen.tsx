import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface ProfileFormData {
    firstName: string;
    lastName: string;
}

export default function ProfileScreen() {
    const { signOut } = useAuth();
    const { user, isLoaded } = useUser();
    const router = useRouter();

    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ProfileFormData>({
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
        },
    });

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                    try {
                        await signOut();
                        router.replace("/sign-in");
                    } catch (error) {
                        console.error("Sign out error:", error);
                    }
                },
            },
        ]);
    };

    const onSubmit = async (data: ProfileFormData) => {
        if (!user) return;

        setLoading(true);
        try {
            await user.update({
                firstName: data.firstName,
                lastName: data.lastName,
            });
            setEditMode(false);
            Alert.alert("Success", "Profile updated successfully!");
        } catch (error: any) {
            console.error("Update profile error:", error);
            Alert.alert("Error", "Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = () => {
        if (!user) return "";
        const first = user.firstName?.[0] || "";
        const last = user.lastName?.[0] || "";
        return `${first}${last}`.toUpperCase();
    };

    if (!isLoaded) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <Text className="text-gray-600">Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="items-center pt-16 pb-8">
                    {user?.imageUrl ? (
                        <Image
                            source={{ uri: user.imageUrl }}
                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                        />
                    ) : (
                        <View className="w-24 h-24 rounded-full bg-black items-center justify-center border-4 border-white shadow-lg">
                            <Text className="text-white text-2xl font-bold">
                                {getInitials()}
                            </Text>
                        </View>
                    )}
                    <Text className="text-2xl font-bold text-gray-900 mt-4">
                        {user?.fullName || "User"}
                    </Text>
                    <Text className="text-gray-600 text-base">
                        {user?.primaryEmailAddress?.emailAddress}
                    </Text>
                </View>

                {/* Profile Form */}
                <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-xl font-bold text-gray-900">
                            Profile Information
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                if (editMode) {
                                    setEditMode(false);
                                    reset({
                                        firstName: user?.firstName || "",
                                        lastName: user?.lastName || "",
                                    });
                                } else {
                                    setEditMode(true);
                                }
                            }}
                            className="p-2"
                        >
                            <Ionicons
                                name={editMode ? "close" : "pencil"}
                                size={20}
                                color="#374151"
                            />
                        </TouchableOpacity>
                    </View>

                    {editMode ? (
                        <View>
                            <View className="flex-row space-x-3 mb-4">
                                <View className="flex-1">
                                    <Controller
                                        control={control}
                                        name="firstName"
                                        rules={{ required: "First name is required" }}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <Input
                                                label="First Name"
                                                placeholder="Enter first name"
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                error={errors.firstName?.message}
                                            />
                                        )}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Controller
                                        control={control}
                                        name="lastName"
                                        rules={{ required: "Last name is required" }}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <Input
                                                label="Last Name"
                                                placeholder="Enter last name"
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                error={errors.lastName?.message}
                                            />
                                        )}
                                    />
                                </View>
                            </View>

                            <Button
                                title="Save Changes"
                                onPress={handleSubmit(onSubmit)}
                                loading={loading}
                            />
                        </View>
                    ) : (
                        <View className="space-y-4">
                            <View>
                                <Text className="text-gray-600 text-sm mb-1">Full Name</Text>
                                <Text className="text-gray-900 text-base font-medium">
                                    {user?.fullName || "Not provided"}
                                </Text>
                            </View>
                            <View>
                                <Text className="text-gray-600 text-sm mb-1">Email</Text>
                                <Text className="text-gray-900 text-base font-medium">
                                    {user?.primaryEmailAddress?.emailAddress || "Not provided"}
                                </Text>
                            </View>
                            <View>
                                <Text className="text-gray-600 text-sm mb-1">Member Since</Text>
                                <Text className="text-gray-900 text-base font-medium">
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString()
                                        : "N/A"}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Connected Accounts */}
                {user?.externalAccounts && user.externalAccounts.length > 0 && (
                    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                        <Text className="text-xl font-bold text-gray-900 mb-4">
                            Connected Accounts
                        </Text>
                        <View className="space-y-3">
                            {user.externalAccounts.map((account, index) => {
                                const providerString = account.provider?.toString() || "";
                                const isGoogle = providerString.includes("google");
                                const isGithub = providerString.includes("github");
                                const isApple = providerString.includes("apple");

                                return (
                                    <View
                                        key={index}
                                        className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                                    >
                                        <View className="flex-row items-center">
                                            <Ionicons
                                                name={
                                                    isGoogle
                                                        ? "logo-google"
                                                        : isGithub
                                                            ? "logo-github"
                                                            : isApple
                                                                ? "logo-apple"
                                                                : "link-outline"
                                                }
                                                size={20}
                                                color={
                                                    isGoogle
                                                        ? "#4285F4"
                                                        : isGithub
                                                            ? "#333"
                                                            : isApple
                                                                ? "#000"
                                                                : "#6b7280"
                                                }
                                            />
                                            <View className="ml-3">
                                                <Text className="text-gray-900 font-medium">
                                                    {isGoogle
                                                        ? "Google"
                                                        : isGithub
                                                            ? "GitHub"
                                                            : isApple
                                                                ? "Apple"
                                                                : providerString}
                                                </Text>
                                                <Text className="text-gray-500 text-sm">
                                                    {account.emailAddress || "Connected"}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="w-3 h-3 bg-green-500 rounded-full" />
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Settings */}
                <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Settings</Text>
                    <View className="space-y-4">
                        <TouchableOpacity className="flex-row items-center justify-between py-3">
                            <View className="flex-row items-center">
                                <Ionicons
                                    name="notifications-outline"
                                    size={20}
                                    color="#6b7280"
                                />
                                <Text className="text-gray-900 font-medium ml-3">
                                    Notifications
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center justify-between py-3">
                            <View className="flex-row items-center">
                                <Ionicons name="shield-outline" size={20} color="#6b7280" />
                                <Text className="text-gray-900 font-medium ml-3">
                                    Privacy & Security
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center justify-between py-3">
                            <View className="flex-row items-center">
                                <Ionicons
                                    name="help-circle-outline"
                                    size={20}
                                    color="#6b7280"
                                />
                                <Text className="text-gray-900 font-medium ml-3">
                                    Help & Support
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sign Out */}
                <View className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
                    <Button title="Sign Out" variant="outline" onPress={handleSignOut} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
