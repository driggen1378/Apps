const KEY = 'lessons-learned-draft';

export function saveSession(session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch (e) {
    // Quota exceeded or private browsing — fail silently
  }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function hasSession() {
  return !!localStorage.getItem(KEY);
}
