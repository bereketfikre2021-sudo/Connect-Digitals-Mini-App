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
