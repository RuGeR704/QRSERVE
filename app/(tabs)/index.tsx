import { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    FlatList, Modal, Alert, Share, Linking
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useQRStorage } from '../../hooks/useQRStorage';
import { QRCode as QRCodeType, QRCategory } from '../../types/qr';
import { CATEGORIES } from '../../constants/categories';
import QRCard from '../../components/QRCard';

const isEmoji = (str: string) => /\p{Emoji}/u.test(str);

export default function HomeScreen() {
    const [mostUsed, setMostUsed] = useState<QRCodeType[]>([]);
    const [recent, setRecent] = useState<QRCodeType[]>([]);
    const [selectedQR, setSelectedQR] = useState<QRCodeType | null>(null);
    const [showQR, setShowQR] = useState(false);
    const [qrForModal, setQrForModal] = useState<QRCodeType | null>(null);
    const { getMostUsed, getRecent, remove, incrementUsage } = useQRStorage();

    const loadData = async () => {
        const used = await getMostUsed(10);
        const rec = await getRecent(20);
        setMostUsed(used);
        setRecent(rec);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleOpen = async (qr: QRCodeType) => {
        await incrementUsage(qr.id);
        setSelectedQR(qr);
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete', 'Do you want to delete this QR Code?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    await remove(id);
                    await loadData();
                }
            }
        ]);
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
                Alert.alert('Errore', 'Impossibile aprire questo link');
            }
        } else {
            Alert.alert('Contenuto QR', content);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>QR</Text>
                    <Text style={styles.logoAccent}>SERVE</Text>
                </View>

                {/* Sezione più usati */}
                {mostUsed.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⭐ Most Used</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.carouselContent}
                        >
                            {mostUsed.map(qr => (
                                <TouchableOpacity
                                    key={qr.id}
                                    style={styles.carouselCard}
                                    onPress={() => handleOpen(qr)}
                                >
                                    <View style={[styles.carouselIcon, { backgroundColor: CATEGORIES[qr.category].color + '20' }]}>
                                        {isEmoji(qr.icon) ? (
                                            <Text style={styles.carouselEmoji}>{qr.icon}</Text>
                                        ) : (
                                            <MaterialIcons
                                                name={CATEGORIES[qr.category].icon as any}
                                                size={32}
                                                color={CATEGORIES[qr.category].color}
                                            />
                                        )}
                                    </View>
                                    <Text style={styles.carouselTitle} numberOfLines={2}>{qr.title}</Text>
                                    <Text style={styles.carouselUsage}>{qr.usageCount}x</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Sezione recenti */}
                {recent.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🕐 Recently Scanned</Text>
                        {recent.map(qr => (
                            <QRCard
                                key={qr.id}
                                qr={qr}
                                onPress={handleOpen}
                                onDelete={handleDelete}
                            />
                        ))}
                    </View>
                )}

                {/* Stato vuoto */}
                {mostUsed.length === 0 && recent.length === 0 && (
                    <View style={styles.empty}>
                        <MaterialIcons name="qr-code-scanner" size={80} color="#ddd" />
                        <Text style={styles.emptyTitle}>No QR Saved</Text>
                        <Text style={styles.emptyText}>Go to SCAN to add your first QR code!</Text>
                    </View>
                )}

            </ScrollView>

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
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24,
    },
    logo: { fontSize: 32, fontWeight: '900', color: '#222', letterSpacing: 1, textAlign: "center"},
    logoAccent: { fontSize: 32, fontWeight: '900', color: '#3B8BD4', letterSpacing: 1 },
    section: { paddingHorizontal: 16, marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 14 },
    carouselContent: { paddingRight: 16 },
    carouselCard: {
        width: 110, backgroundColor: '#fff', borderRadius: 16, padding: 14,
        marginRight: 12, alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    carouselIcon: {
        width: 56, height: 56, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    carouselEmoji: { fontSize: 28 },
    carouselTitle: { fontSize: 12, fontWeight: '600', color: '#222', textAlign: 'center', marginBottom: 4 },
    carouselUsage: { fontSize: 11, color: '#aaa' },
    empty: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingTop: 100, paddingHorizontal: 40, gap: 12,
    },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#ccc' },
    emptyText: { fontSize: 14, color: '#bbb', textAlign: 'center', lineHeight: 22 },
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