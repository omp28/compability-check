declare global {
  interface Window {
    gtag: (command: 'config' | 'event', idOrEventName: string, params?: Record<string, unknown>) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID as string;

// Pageview tracking
export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};
