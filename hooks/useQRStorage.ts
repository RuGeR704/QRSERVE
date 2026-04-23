import AsyncStorage from '@react-native-async-storage/async-storage';
import { QRCode, QRCategory } from '../types/qr';

const STORAGE_KEY = '@qr_serve_codes';

export const useQRStorage = () => {

    const getAll = async (): Promise<QRCode[]> => {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEY);
            return json ? JSON.parse(json) : [];
        } catch {
            return [];
        }
    };

    const save = async (qr: QRCode): Promise<void> => {
        const all = await getAll();
        const updated = [qr, ...all];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const incrementUsage = async (id: string): Promise<void> => {
        const all = await getAll();
        const updated = all.map(qr =>
            qr.id === id
                ? { ...qr, usageCount: qr.usageCount + 1, lastUsedAt: Date.now() }
                : qr
        );
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const remove = async (id: string): Promise<void> => {
        const all = await getAll();
        const updated = all.filter(qr => qr.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const getMostUsed = async (limit = 5): Promise<QRCode[]> => {
        const all = await getAll();
        return [...all]
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, limit);
    };

    const getRecent = async (limit = 10): Promise<QRCode[]> => {
        const all = await getAll();
        return [...all]
            .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
            .slice(0, limit);
    };

    const search = async (query: string, category?: QRCategory): Promise<QRCode[]> => {
        const all = await getAll();
        return all.filter(qr => {
            const matchTitle = qr.title.toLowerCase().includes(query.toLowerCase());
            const matchCategory = category ? qr.category === category : true;
            return matchTitle && matchCategory;
        });
    };

    return { getAll, save, incrementUsage, remove, getMostUsed, getRecent, search };
};