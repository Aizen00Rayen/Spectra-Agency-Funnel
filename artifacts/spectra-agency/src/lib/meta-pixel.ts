/**
 * Meta (Facebook) Pixel Event Tracking Helper
 * Safely dispatches standard and custom conversion events to window.fbq
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export function trackMetaPixel(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (params) {
      window.fbq('track', eventName, params);
    } else {
      window.fbq('track', eventName);
    }
  }
}

export function trackMetaCustom(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (params) {
      window.fbq('trackCustom', eventName, params);
    } else {
      window.fbq('trackCustom', eventName);
    }
  }
}
