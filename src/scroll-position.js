export function saveScrollPosition (key) {
  if (!key) return;
  window.sessionStorage.setItem(key, JSON.stringify({
    x: window.pageXOffset,
    y: window.pageYOffset
  }));
}
