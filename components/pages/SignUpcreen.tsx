import { useAuth, useSignUp, useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { api } from "~/services/api";
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

interface SignUpFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface SignUpScreenProps {
    onSignIn?: () => void;
}

export default function SignUpScreen({ onSignIn }: SignUpScreenProps) {
    useWarmUpBrowser();
    const { getToken, signOut } = useAuth()
    const { isLoaded, signUp, setActive } = useSignUp();
    const { startSSOFlow } = useSSO();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");

    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<SignUpFormData>({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: SignUpFormData) => {
        if (!isLoaded) return;

        setLoading(true);
        try {
            await signUp.create({
                firstName: data.firstName,
                lastName: data.lastName,
                emailAddress: data.email,
                password: data.password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setPendingVerification(true);
        } catch (err: any) {
            console.error("Sign up error:", JSON.stringify(err, null, 2));
            setError("root", {
                message: err.errors?.[0]?.message || "Algo deu errado",
            });
        } finally {
            setLoading(false);
        }
    };

    const onVerifyPress = async () => {
        if (!isLoaded) return;

        setLoading(true);
        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (signUpAttempt.status === "complete") {
                // Ativa a sessão para obter o token
                await setActive({ session: signUpAttempt.createdSessionId });

                // ✅ Obtem token JWT da Clerk
                const token = await getToken()
                if (!token) {
                    setError("root", { message: "Erro ao obter token de autenticação." });
                    setLoading(false);
                    return;
                }

                // ✅ Envia token para o back-end (criação de cliente no Stripe)
                await api.post("/criar-cliente", {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                // Faz sign out e redireciona para login
                // Faz sign out e redireciona para login

                await signOut();

                router.replace("/(auth)/sign-in");
            }
        } catch (err: any) {
            console.error("Verification error:", JSON.stringify(err, null, 2));
            setError("root", {
                message: "Código de verificação inválido",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialSignUp = useCallback(
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
                console.error("Social sign up error:", JSON.stringify(err, null, 2));
                setError("root", {
                    message: "Falha no cadastro social. Tente novamente.",
                });
            } finally {
                setSocialLoading(false);
            }
        },
        []
    );

    if (pendingVerification) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                    <View className="items-center pt-16 pb-8">
                        <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6">
                            <Ionicons name="mail-outline" size={40} color="#3b82f6" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 mb-2">
                            Check Seu Email
                        </Text>
                        <Text className="text-gray-600 text-center mb-8">
                            Enviamos um código de verificação para seu endereço de e-mail.
                        </Text>
                    </View>

                    <Input
                        label="Código de verificação"
                        placeholder="Enter 6-digit code"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                    />

                    {errors.root && (
                        <Text className="text-red-500 text-sm mb-4 text-center">
                            {errors.root.message}
                        </Text>
                    )}

                    <Button
                        title="Verificar e-mail"
                        onPress={onVerifyPress}
                        loading={loading}
                    />

                    <TouchableOpacity
                        onPress={() => setPendingVerification(false)}
                        className="mt-4"
                    >
                        <Text className="text-blue-600 text-center font-medium">
                            Voltar para se inscrever
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 mt-9">
            <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                {/* Logo */}
                <View className="items-center pt-16 pb-8">
                    <View className="w-16 h-16 bg-black rounded-2xl items-center justify-center mb-6">
                        <Ionicons name="bus" size={46} color="white" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                        Crie sua conta
                    </Text>
                    <Text className="text-gray-600 text-center">
                        Junte-se a nós e comece sua jornada.
                    </Text>
                </View>

                {/* Social Buttons */}
                <View className="mb-6">
                    {/* <SocialButton
                        provider="apple"
                        onPress={() => handleSocialSignUp("oauth_apple")}
                        loading={socialLoading}
                    /> */}
                    <SocialButton
                        provider="google"
                        onPress={() => handleSocialSignUp("oauth_google")}
                        loading={socialLoading}
                    />
                    {/* <SocialButton
                        provider="github"
                        onPress={() => handleSocialSignUp("oauth_github")}
                        loading={socialLoading}
                    /> */}
                </View>

                {/* Divider */}
                <View className="flex-row items-center mb-6">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="px-4 text-gray-500">Ou cadastre-se com e-mail</Text>
                    <View className="flex-1 h-px bg-gray-300" />
                </View>

                {/* Form */}
                <View className="mb-6">
                    <View className="flex-row space-x-3 gap-2 mb-1">
                        <View className="flex-1">
                            <Controller
                                control={control}
                                name="firstName"
                                rules={{ required: "O primeiro nome é obrigatório" }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label="Primeiro nome"
                                        placeholder="John"
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
                                rules={{ required: "O sobrenome é obrigatório" }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label="Sobrenome"
                                        placeholder="Doe"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.lastName?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: "O e-mail é obrigatório",
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: "Invalid email address",
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Email"
                                placeholder="john@example.com"
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
                        rules={{
                            required: "O e-mail é obrigatório",
                            minLength: {
                                value: 8,
                                message: "A senha deve ter pelo menos 8 caracteres",
                            },
                        }}
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

                    {errors.root && (
                        <Text className="text-red-500 text-sm mb-4 text-center">
                            {errors.root.message}
                        </Text>
                    )}

                    <Button
                        title="Criar uma conta"
                        onPress={handleSubmit(onSubmit)}
                        loading={loading}
                    />
                </View>

                {/* Sign In Link */}
                <View className="flex-row justify-center mb-8">
                    <Text className="text-gray-600">Já tem uma conta? </Text>
                    <TouchableOpacity onPress={onSignIn}>
                        <Text className="text-blue-600 font-medium">Entrar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
