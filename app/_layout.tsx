import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot } from 'expo-router'
import "global.css"
import { StatusBar } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

export default function RootLayout() {
    return (
        <ClerkProvider tokenCache={tokenCache}>
            <GestureHandlerRootView style={{ flex: 1 }}>

                <StatusBar />
                <Slot />
            </GestureHandlerRootView>
        </ClerkProvider>
    )
}