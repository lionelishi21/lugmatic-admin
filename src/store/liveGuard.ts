// Module-level singleton so Live.tsx can register a nav-intercept callback
// that Layout.tsx checks before any sidebar navigation.
// All state lives at module scope — no React context needed.

type InterceptFn = (targetPath: string) => void;

let _isLive = false;
let _interceptNav: InterceptFn | null = null;

export const liveGuard = {
  register(interceptFn: InterceptFn) {
    _isLive = true;
    _interceptNav = interceptFn;
  },
  clear() {
    _isLive = false;
    _interceptNav = null;
  },
  get isLive() {
    return _isLive;
  },
  /** Returns true if navigation was intercepted (caller should prevent it). */
  intercept(targetPath: string): boolean {
    if (!_isLive || !_interceptNav) return false;
    _interceptNav(targetPath);
    return true;
  },
};
