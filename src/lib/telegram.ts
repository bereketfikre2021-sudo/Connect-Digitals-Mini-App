/**
 * Telegram WebApp SDK wrapper.
 * Provides typed access and safe fallbacks for non-Telegram environments.
 */
import WebApp from "@twa-dev/sdk";

export { WebApp };

export function isInTelegram(): boolean {
  return Boolean(WebApp.initData);
}

export function getTelegramInitData(): string {
  return WebApp.initData;
}

export function hapticLight() {
  try { WebApp.HapticFeedback.impactOccurred("light"); } catch { /* noop */ }
}
export function hapticMedium() {
  try { WebApp.HapticFeedback.impactOccurred("medium"); } catch { /* noop */ }
}
export function hapticSuccess() {
  try { WebApp.HapticFeedback.notificationOccurred("success"); } catch { /* noop */ }
}
export function hapticError() {
  try { WebApp.HapticFeedback.notificationOccurred("error"); } catch { /* noop */ }
}

export function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      WebApp.showConfirm(message, resolve);
    } catch {
      resolve(window.confirm(message));
    }
  });
}

export function setMainButton(text: string, onClick: () => void, loading = false) {
  WebApp.MainButton.setText(text);
  WebApp.MainButton.onClick(onClick);
  if (loading) WebApp.MainButton.showProgress();
  else WebApp.MainButton.hideProgress();
  WebApp.MainButton.show();
}

export function hideMainButton() {
  try { WebApp.MainButton.hide(); } catch { /* noop */ }
}

/**
 * Returns the startapp parameter from the bot link if present.
 * e.g. https://t.me/YourBot?startapp=service_tiktok-followers
 * Use this to deep-link directly to a service, order, or page.
 */
export function getStartParam(): string | null {
  try {
    return WebApp.initDataUnsafe?.start_param ?? null;
  } catch {
    return null;
  }
}
