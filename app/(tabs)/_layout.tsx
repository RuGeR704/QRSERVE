import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#3B8BD4',
                tabBarInactiveTintColor: '#888780',
                tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0.5 },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="scanner"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="qr-code-scanner" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: 'Scanned QRs',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="folder" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}