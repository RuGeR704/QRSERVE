import { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, Modal,
    TouchableOpacity, ScrollView, Alert, Share, Linking
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useQRStorage } from '../../hooks/useQRStorage';
import { QRCode as QRCodeType, QRCategory } from '../../types/qr';
import { CATEGORIES } from '../../constants/categories';
import QRCard from '../../components/QRCard';
import SearchBar from '../../components/SearchBar';
import CategoryBadge from '../../components/CategoryBadge';

const isEmoji = (str: string) => /\p{Emoji}/u.test(str);

export default function LibraryScreen() {
    const [allQRs, setAllQRs] = useState<QRCodeType[]>([]);
    const [filtered, setFiltered] = useState<QRCodeType[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<QRCategory | null>(null);
    const [selectedQR, setSelectedQR] = useState<QRCodeType | null>(null);
    const [showQR, setShowQR] = useState(false);
    const [qrForModal, setQrForModal] = useState<QRCodeType | null>(null);
    const { getAll, remove, incrementUsage } = useQRStorage();

    const loadQRs = async () => {
        const data = await getAll();
        setAllQRs(data);
        applyFilters(data, searchQuery, selectedCategory);
    };

    const applyFilters = (data: QRCodeType[], query: string, category: QRCategory | null) => {
        let result = data;
        if (query.trim()) {
            result = result.filter(qr =>
                qr.title.toLowerCase().includes(query.toLowerCase())
            );
        }
        if (category) {
            result = result.filter(qr => qr.category === category);
        }
        setFiltered(result);
    };

    useFocusEffect(
        useCallback(() => {
            loadQRs();
        }, [])
    );

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        applyFilters(allQRs, text, selectedCategory);
    };

    const handleCategoryToggle = (cat: QRCategory) => {
        const next = selectedCategory === cat ? null : cat;
        setSelectedCategory(next);
        applyFilters(allQRs, searchQuery, next);
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete', 'Do you want to delete this QR Code?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    await remove(id);
                    await loadQRs();
                }
            }
        ]);
    };

    const handleOpen = async (qr: QRCodeType) => {
        await incrementUsage(qr.id);
        setSelectedQR(qr);
    };

    const handleShare = async (qr: QRCodeType) => {
        await Share.share({ message: `${qr.title}\n${qr.content}` });
    };

    const handleOpenContent = async (content: string) => {
        const isUrl = content.startsWith('http://') || content.startsWith('https://') || content.startsWith('www.');
        if (isUrl) {
            const url = content.startsWith('www.') ? `https://${content}` : content;
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Cannot open this link');
            }
        } else {
            Alert.alert('QR Content', content);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Scanned QRs</Text>

            <SearchBar
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder="Search by title..."
            />

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16, maxHeight: 44 }}
                contentContainerStyle={{ alignItems: 'center' }}
            >
                {(Object.keys(CATEGORIES) as QRCategory[]).map(cat => (
                    <CategoryBadge
                        key={cat}
                        category={cat}
                        selected={selectedCategory === cat}
                        onPress={() => handleCategoryToggle(cat)}
                    />
                ))}
            </ScrollView>

            {filtered.length === 0 ? (
                <View style={styles.empty}>
                    <MaterialIcons name="qr-code" size={64} color="#ddd" />
                    <Text style={styles.emptyText}>
                        {allQRs.length === 0
                            ? 'No QR Code saved\nScan your first QR code!'
                            : 'No Result Found'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <QRCard
                            qr={item}
                            onPress={handleOpen}
                            onDelete={handleDelete}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Modal dettaglio QR */}
            <Modal visible={!!selectedQR} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalCard}>
                        {selectedQR && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={[styles.modalIcon, { backgroundColor: CATEGORIES[selectedQR.category].color + '20' }]}>
                                        {isEmoji(selectedQR.icon) ? (
                                            <Text style={styles.modalEmoji}>{selectedQR.icon}</Text>
                                        ) : (
                                            <MaterialIcons
                                                name={CATEGORIES[selectedQR.category].icon as any}
                                                size={32}
                                                color={CATEGORIES[selectedQR.category].color}
                                            />
                                        )}
                                    </View>
                                    <View style={styles.modalInfo}>
                                        <Text style={styles.modalTitle}>{selectedQR.title}</Text>
                                        <Text style={styles.modalCategory}>{CATEGORIES[selectedQR.category].label}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setSelectedQR(null)}>
                                        <MaterialIcons name="close" size={24} color="#999" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.contentBox}
                                    onPress={() => handleOpenContent(selectedQR.content)}
                                >
                                    <Text style={styles.contentLabel}>QR Content</Text>
                                    <Text style={styles.contentText} selectable>{selectedQR.content}</Text>
                                    {(selectedQR.content.startsWith('http') || selectedQR.content.startsWith('www.')) && (
                                        <View style={styles.openLinkRow}>
                                            <MaterialIcons name="open-in-new" size={14} color="#3B8BD4" />
                                            <Text style={styles.openLinkText}>Open Link</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.statsRow}>
                                    <View style={styles.stat}>
                                        <Text style={styles.statValue}>{selectedQR.usageCount}</Text>
                                        <Text style={styles.statLabel}>Uses</Text>
                                    </View>
                                    <View style={styles.stat}>
                                        <Text style={styles.statValue}>
                                            {new Date(selectedQR.createdAt).toLocaleDateString('it-IT')}
                                        </Text>
                                        <Text style={styles.statLabel}>Saved on</Text>
                                    </View>
                                </View>

                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleShare(selectedQR)}
                                    >
                                        <MaterialIcons name="share" size={22} color="#3B8BD4" />
                                        <Text style={styles.actionBtnText}>Share</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.actionBtnQR]}
                                        onPress={() => {
                                            setQrForModal(selectedQR);
                                            setSelectedQR(null);
                                            setTimeout(() => setShowQR(true), 300);
                                        }}
                                    >
                                        <MaterialIcons name="qr-code" size={22} color="#fff" />
                                        <Text style={[styles.actionBtnText, { color: '#fff' }]}>Show QR</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal QR visuale */}
            <Modal visible={showQR} animationType="fade" transparent>
                <View style={styles.qrModalBg}>
                    <View style={styles.qrModalCard}>
                        <Text style={styles.qrModalTitle}>{qrForModal?.title}</Text>
                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={qrForModal?.content || ' '}
                                size={200}
                                color="#222"
                                backgroundColor="#fff"
                            />
                        </View>
                        <TouchableOpacity style={styles.qrCloseBtn} onPress={() => setShowQR(false)}>
                            <Text style={styles.qrCloseBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8', paddingHorizontal: 16, paddingTop: 60 },
    header: { fontSize: 28, fontWeight: '700', color: '#222', marginBottom: 16 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyText: { fontSize: 15, color: '#bbb', textAlign: 'center', lineHeight: 22 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: {
        backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 48,
    },
    modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    modalIcon: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    modalEmoji: { fontSize: 30 },
    modalInfo: { flex: 1 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
    modalCategory: { fontSize: 13, color: '#999', marginTop: 2 },
    contentBox: { backgroundColor: '#f8f8f8', borderRadius: 12, padding: 14, marginBottom: 16 },
    contentLabel: { fontSize: 11, fontWeight: '600', color: '#aaa', marginBottom: 6, textTransform: 'uppercase' },
    contentText: { fontSize: 14, color: '#444', lineHeight: 20 },
    openLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    openLinkText: { fontSize: 12, color: '#3B8BD4', fontWeight: '500' },
    statsRow: { flexDirection: 'row', marginBottom: 20 },
    stat: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '700', color: '#222' },
    statLabel: { fontSize: 12, color: '#aaa', marginTop: 2 },
    actionRow: { flexDirection: 'row', gap: 12 },
    actionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: 14, borderRadius: 12, backgroundColor: '#EEF5FF',
    },
    actionBtnQR: { backgroundColor: '#3B8BD4' },
    actionBtnText: { fontSize: 15, fontWeight: '600', color: '#3B8BD4' },
    qrModalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
    qrModalCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 32,
        alignItems: 'center', width: '80%',
    },
    qrModalTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 20 },
    qrWrapper: { marginBottom: 24 },
    qrCloseBtn: { backgroundColor: '#f0f0f0', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
    qrCloseBtnText: { fontSize: 15, fontWeight: '600', color: '#555' },
});