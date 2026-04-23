import { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, Modal, TextInput,
    TouchableOpacity, ScrollView, Alert
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useQRStorage } from '../../hooks/useQRStorage';
import { QRCode, QRCategory } from '../../types/qr';
import { CATEGORIES } from '../../constants/categories';

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [showModal, setShowModal] = useState(false);
    const [scannedData, setScannedData] = useState('');
    const [title, setTitle] = useState('');
    const [emoji, setEmoji] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<QRCategory>('altro');
    const isProcessing = useRef(false);
    const { save } = useQRStorage();

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <MaterialIcons name="camera-alt" size={48} color="#888" />
                <Text style={styles.permText}>Camera access is required</Text>
                <TouchableOpacity style={styles.btn} onPress={requestPermission}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (isProcessing.current) return;
        isProcessing.current = true;
        setScannedData(data);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Warning', 'Please enter a title for the QR Code');
            return;
        }

        const newQR: QRCode = {
            id: Date.now().toString(),
            title: title.trim(),
            content: scannedData,
            category: selectedCategory,
            icon: emoji.trim() || CATEGORIES[selectedCategory].icon,
            imageUri: '',
            createdAt: Date.now(),
            lastUsedAt: Date.now(),
            usageCount: 0,
        };

        await save(newQR);
        Alert.alert('Saved!', `"${title}" added to your library`);
        setShowModal(false);
        setTitle('');
        setEmoji('');
        setSelectedCategory('altro');
        isProcessing.current = false;
    };

    const handleCancel = () => {
        setShowModal(false);
        setTitle('');
        setEmoji('');
        setSelectedCategory('altro');
        isProcessing.current = false;
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={handleBarCodeScanned}
            />

            <View style={styles.overlay}>
                <Text style={styles.topLabel}>QR-SERVE</Text>
                <View style={styles.frame} />
                <Text style={styles.hint}>Point at a QR Code</Text>
            </View>

            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Save QR Code</Text>
                        <Text style={styles.modalSub} numberOfLines={2}>{scannedData}</Text>

                        <Text style={styles.label}>Title and icon</Text>
                        <View style={styles.titleRow}>
                            <TextInput
                                style={styles.emojiInput}
                                placeholder="😀"
                                value={emoji}
                                onChangeText={setEmoji}
                                maxLength={2}
                            />
                            <TextInput
                                style={styles.titleInput}
                                placeholder="e.g. Coffee shop Wi-Fi"
                                value={title}
                                onChangeText={setTitle}
                                autoFocus
                            />
                        </View>

                        <Text style={styles.label}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
                            {(Object.keys(CATEGORIES) as QRCategory[]).map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                                    onPress={() => setSelectedCategory(cat)}
                                >
                                    <MaterialIcons
                                        name={CATEGORIES[cat].icon as any}
                                        size={16}
                                        color={selectedCategory === cat ? '#fff' : '#555'}
                                    />
                                    <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
                                        {CATEGORIES[cat].label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.btnSecondary} onPress={handleCancel}>
                                <Text style={styles.btnSecondaryText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btn} onPress={handleSave}>
                                <Text style={styles.btnText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
    overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    topLabel: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 40, letterSpacing: 2 },
    frame: {
        width: 240, height: 240, borderWidth: 2, borderColor: '#fff',
        borderRadius: 12, backgroundColor: 'transparent',
    },
    hint: { color: '#fff', marginTop: 20, fontSize: 14, opacity: 0.8 },
    permText: { fontSize: 16, textAlign: 'center', color: '#555', marginTop: 8 },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: {
        backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 24, paddingBottom: 40,
    },
    modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
    modalSub: { fontSize: 12, color: '#888', marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '500', color: '#444', marginBottom: 6 },
    titleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    emojiInput: {
        width: 52, height: 48, borderWidth: 1, borderColor: '#ddd',
        borderRadius: 10, textAlign: 'center', fontSize: 22,
    },
    titleInput: {
        flex: 1, borderWidth: 1, borderColor: '#ddd',
        borderRadius: 10, padding: 12, fontSize: 15,
    },
    catRow: { marginBottom: 20 },
    catChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#f0f0f0', marginRight: 8,
    },
    catChipActive: { backgroundColor: '#3B8BD4' },
    catText: { fontSize: 13, color: '#555' },
    catTextActive: { color: '#fff' },
    modalActions: { flexDirection: 'row', gap: 12 },
    btn: { flex: 1, backgroundColor: '#3B8BD4', padding: 14, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
    btnSecondary: { flex: 1, backgroundColor: '#f0f0f0', padding: 14, borderRadius: 12, alignItems: 'center' },
    btnSecondaryText: { color: '#555', fontWeight: '500', fontSize: 15 },
});