import { QRCategory } from '../types/qr';

export interface CategoryMeta {
    label: string;
    icon: string;
    color: string;
}

export const CATEGORIES: Record<QRCategory, CategoryMeta> = {
    wifi:             { label: 'Wi-Fi',         icon: 'wifi',          color: '#3B8BD4' },
    menu_bar:         { label: 'Bar Menu',       icon: 'local-bar',     color: '#EF9F27' },
    menu_ristorante:  { label: 'Restaurant',     icon: 'restaurant',    color: '#D85A30' },
    biglietto_visita: { label: 'Business Card',  icon: 'contact-page',  color: '#1D9E75' },
    link:             { label: 'Link',           icon: 'link',          color: '#534AB7' },
    pagamento:        { label: 'Payment',        icon: 'payments',      color: '#639922' },
    social:           { label: 'Social',         icon: 'share',         color: '#D4537E' },
    altro:            { label: 'Other',          icon: 'qr-code',       color: '#888780' },
};