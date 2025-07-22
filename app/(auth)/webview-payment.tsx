import { useLocalSearchParams, useRouter } from "expo-router";
import WebViewPayment from "~/components/pages/WebViewPayment";

export default function Payment() {
  const router = useRouter();
  const { url } = useLocalSearchParams<{ url: string }>();

  return (
    <WebViewPayment
      url={typeof url === "string" ? url : ""}
      onSignIn={() => router.push("/(auth)/sign-in")}
    />
  );
}