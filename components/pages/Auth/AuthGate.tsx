import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "~/services/api";
import AccessDenied from "./AccessDenied";
import AuthLoading from "./AuthLoading";

export default function AuthGate() {
  const { isSignedIn, isLoaded, getToken, signOut } = useAuth();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [acessoLiberado, setAcessoLiberado] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  // Resetar estados ao deslogar para evitar flash de profile
  useEffect(() => {
    if (!isSignedIn) {
      setAcessoLiberado(false);
      setPortalUrl(null);
    }
  }, [isSignedIn]);

  useEffect(() => {
    const verificarAcesso = async () => {
      if (!isLoaded || !isSignedIn) {
        setCheckingAccess(false);
        return;
      }

      try {
        const token = await getToken();
        const { data } = await api.get("/verificar-assinatura", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data.acesso) {
          setAcessoLiberado(true);
        } else {
          setPortalUrl(data.checkoutUrl || null);
        }
      } catch (err) {
        console.error("Erro ao verificar assinatura:", err);
      } finally {
        setCheckingAccess(false);
      }
    };

    verificarAcesso();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || checkingAccess) return <AuthLoading />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  if (isSignedIn && !acessoLiberado && !checkingAccess)
    return <AccessDenied portalUrl={portalUrl} onSignOut={signOut} />;
  return <Redirect href="/(tabs)/map" />;
}