
import { useAuth, useSignIn, useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Button from "../ui/Button";
import Input from "../ui/Input";
import SocialButton from "../ui/SocialButton";

// Browser optimization hook
export const useWarmUpBrowser = () => {
    useEffect(() => {
        void WebBrowser.warmUpAsync();
        return () => {
            void WebBrowser.coolDownAsync();
        };
    }, []);
};

WebBrowser.maybeCompleteAuthSession();

interface SignInFormData {
    email: string;
    password: string;
}

interface SignInScreenProps {
    onSignUp?: () => void;
}

export default function SignInScreen({ onSignUp }: SignInScreenProps) {
    // useWarmUpBrowser();
    const { getToken } = useAuth()
    const { signIn, setActive, isLoaded } = useSignIn();
    const { startSSOFlow } = useSSO();
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<SignInFormData>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: SignInFormData) => {
        if (!isLoaded) return;

        setLoading(true);
        try {
            const signInAttempt = await signIn.create({
                identifier: data.email,
                password: data.password,
            });

            if (signInAttempt.status === "complete") {
                await setActive({ session: signInAttempt.createdSessionId });

                // ✅ Pega o token JWT do Clerk
                const token = await getToken();
                if (!token) {
                    Alert.alert("Erro", "Não foi possível obter o token de autenticação.");
                    setLoading(false);
                    return;
                }

                // // ✅ Chama o back-end para verificar a assinatura
                // const resultado = await api.get("/verificar-assinatura", {
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // });

                // if (resultado.data.acesso) {
                //     router.replace("/(home)/profile");
                // } else {
                //     Alert.alert(
                //         "Assinatura Pendente",
                //         "Sua assinatura está pendente. Deseja regularizar agora?",
                //         [
                //             {
                //                 text: "Cancelar",
                //                 style: "cancel",
                //             },
                //             resultado.data.portalUrl
                //                 ? {
                //                     text: "Regularizar",
                //                     onPress: () => {
                //                         Linking.openURL(resultado.data.portalUrl);
                //                     },
                //                 }
                //                 : undefined,
                //         ].filter(Boolean) as any // remove undefined
                //     );
                // }
            }
        } catch (err: any) {
            console.error("Sign in error:", JSON.stringify(err, null, 2));
            setError("root", {
                message: err.errors?.[0]?.message || "Email ou senha inválidos.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialSignIn = useCallback(
        async (strategy: "oauth_google" | "oauth_github" | "oauth_apple") => {
            setSocialLoading(true);
            try {
                const { createdSessionId, setActive } = await startSSOFlow({
                    strategy,
                    redirectUrl: AuthSession.makeRedirectUri(),
                });

                if (createdSessionId) {
                    setActive!({ session: createdSessionId });
                    router.replace("/(home)/profile");
                }
            } catch (err: any) {
                console.error("Social sign in error:", JSON.stringify(err, null, 2));
                setError("root", {
                    message: "Social sign in failed. Please try again.",
                });
            } finally {
                setSocialLoading(false);
            }
        },
        []
    );

    return (
        <SafeAreaView className="flex-1  mt-9 ">
            <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                {/* Logo */}
                <View className="items-center pt-16 pb-8">
                    <View className="w-16 h-16 bg-black rounded-2xl items-center justify-center mb-6">
                        <Ionicons name="bus" size={46} color="white" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                        Lottapp - Conectando motoristas em tempo real
                    </Text>
                    <Text className="text-gray-600 text-center">
                        Entre ou registre-se e começaremos.
                    </Text>
                </View>

                {/* Form */}
                <View className="mb-6">
                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: "Email is required",
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Invalid email address",
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Email"
                                placeholder="email@gmail.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        rules={{ required: "Password is required" }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Password"
                                placeholder="••••••••••••"
                                secureTextEntry={!showPassword}
                                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                                onRightIconPress={() => setShowPassword(!showPassword)}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.password?.message}
                            />
                        )}
                    />

                    <TouchableOpacity className="mb-6">
                        <Text className="text-blue-600 text-right font-medium">
                            Forgot password?
                        </Text>
                    </TouchableOpacity>

                    {errors.root && (
                        <Text className="text-red-500 text-sm mb-4 text-center">
                            {errors.root.message}
                        </Text>
                    )}

                    <Button
                        title="Sign In"
                        onPress={handleSubmit(onSubmit)}
                        loading={loading}
                    />
                </View>

                {/* Divider */}
                <View className="flex-row items-center mb-6">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="px-4 text-gray-500">Or</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                </View>

                {/* Social Buttons */}
                <View className="mb-8">
                    {/* <SocialButton
                        provider="apple"
                        onPress={() => handleSocialSignIn("oauth_apple")}
                        loading={socialLoading}
                    /> */}
                    <SocialButton
                        provider="google"
                        onPress={() => handleSocialSignIn("oauth_google")}
                        loading={socialLoading}
                    />
                    {/* <SocialButton
                        provider="github"
                        onPress={() => handleSocialSignIn("oauth_github")}
                        loading={socialLoading}
                    /> */}
                </View>

                {/* Sign Up Link */}
                <View className="flex-row justify-center mb-8">
                    <Text className="text-gray-600">Not a member? </Text>
                    <TouchableOpacity onPress={onSignUp}>
                        <Text className="text-blue-600 font-medium">Register</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
