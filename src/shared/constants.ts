export const DESIGN_TOKENS = {
  colors: {
    primary: '#00a7e1',
    primaryHover: '#00a7ff',
    background: '#FFFFFF',
    title: '#000000',
    body: '#666666',
    price: '#1b1b1b',
    originalPrice: '#636363',
    buttonPrimaryBg: '#00a7e1',
    buttonPrimaryText: '#ffffff',
    buttonSecondaryBg: '#ffffff',
    buttonSecondaryText: '#000000',
    footerBg: '#272727',
    footerText: '#a5a5a5',
    footerTitle: '#ffffff',
    footerLink: '#c6c1c1',
    navbarBg: '#ffffff',
    announcementBg: '#000000',
    announcementText: '#ffffff',
    border: '#e5e5e5',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
    sizes: {
      h1: '34px',
      h2: '24px',
      h3: '20px',
      body: '16px',
      small: '14px',
      xsmall: '12px',
    },
  },
  layout: {
    maxWidth: '1400px',
    mobilePadding: '20px',
    breakpoints: {
      mobile: '768px',
      tablet: '1200px',
    },
  },
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BKASH: 'bKash',
  NAGAD: 'Nagad',
};

export const SITE_NAME = 'Piece Style';
export const SITE_DESCRIPTION = 'Premium Home Appliances';
