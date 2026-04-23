export type QRCategory =
    | 'wifi'
    | 'menu_bar'
    | 'menu_ristorante'
    | 'biglietto_visita'
    | 'link'
    | 'pagamento'
    | 'social'
    | 'altro';

export interface QRCode {
    id: string;           // UUID univoco
    title: string;        // Titolo impostato dall'utente
    content: string;      // Contenuto decodificato dal QR
    category: QRCategory;
    icon: string;         // Nome icona da @expo/vector-icons
    imageUri: string;     // Percorso locale della foto del QR
    createdAt: number;    // timestamp
    lastUsedAt: number;   // per ordinamento "più recenti"
    usageCount: number;   // per ordinamento "più frequenti"
}