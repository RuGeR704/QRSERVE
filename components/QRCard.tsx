import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { QRCode } from '../types/qr';
import { CATEGORIES } from '../constants/categories';

interface Props {
    qr: QRCode;
    onPress: (qr: QRCode) => void;
    onDelete: (id: string) => void;
}

const isEmoji = (str: string) => /\p{Emoji}/u.test(str);

export default function QRCard({ qr, onPress, onDelete }: Props) {
    const category = CATEGORIES[qr.category];
    const hasEmoji = isEmoji(qr.icon);

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(qr)}>
            <View style={[styles.iconBox, { backgroundColor: category.color + '20' }]}>
                {hasEmoji ? (
                    <Text style={styles.emoji}>{qr.icon}</Text>
                ) : (
                    <MaterialIcons name={category.icon as any} size={28} color={category.color} />
                )}
            </View>
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{qr.title}</Text>
                <View style={styles.meta}>
                    <View style={[styles.badge, { backgroundColor: category.color + '20' }]}>
                        <Text style={[styles.badgeText, { color: category.color }]}>{category.label}</Text>
                    </View>
                    <Text style={styles.usage}>
                        {qr.usageCount > 0 ? `Used ${qr.usageCount}x` : 'Never used'}
                    </Text>
                </View>
                <Text style={styles.content} numberOfLines={1}>{qr.content}</Text>
            </View>
            <TouchableOpacity onPress={() => onDelete(qr.id)} style={styles.deleteBtn}>
                <MaterialIcons name="delete-outline" size={22} color="#ccc" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 14, padding: 14, marginBottom: 10,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    iconBox: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    emoji: { fontSize: 26 },
    info: { flex: 1 },
    title: { fontSize: 15, fontWeight: '600', color: '#222', marginBottom: 4 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
    badgeText: { fontSize: 11, fontWeight: '600' },
    usage: { fontSize: 11, color: '#aaa' },
    content: { fontSize: 12, color: '#bbb' },
    deleteBtn: { padding: 4 },
});