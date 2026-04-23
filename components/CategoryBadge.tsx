import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { QRCategory } from '../types/qr';
import { CATEGORIES } from '../constants/categories';

interface Props {
    category: QRCategory;
    selected: boolean;
    onPress: () => void;
}

export default function CategoryBadge({ category, selected, onPress }: Props) {
    const meta = CATEGORIES[category];
    return (
        <TouchableOpacity
            style={[styles.chip, selected && { backgroundColor: meta.color }]}
            onPress={onPress}
        >
            <MaterialIcons
                name={meta.icon as any}
                size={14}
                color={selected ? '#fff' : meta.color}
            />
            <Text style={[styles.label, selected && styles.labelSelected]}>
                {meta.label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
        backgroundColor: '#f0f0f0', marginRight: 8,
    },
    label: { fontSize: 12, fontWeight: '500', color: '#555' },
    labelSelected: { color: '#fff' },
});