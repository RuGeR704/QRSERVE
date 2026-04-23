import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder }: Props) {
    return (
        <View style={styles.container}>
            <MaterialIcons name="search" size={20} color="#aaa" style={styles.icon} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder ?? 'Search QR Codes...'}
                placeholderTextColor="#bbb"
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText('')}>
                    <MaterialIcons name="close" size={18} color="#aaa" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f5f5f5', borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
    },
    icon: { marginRight: 8 },
    input: { flex: 1, fontSize: 15, color: '#333' },
});