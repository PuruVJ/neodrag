const HYDRATE_KEY = `astro:hydrate`;
function debounce(cb, wait = 20) {
  let h = 0;
  let callable = (...args) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), wait);
  };
  return callable;
}
const notify = debounce(() => {
  window.dispatchEvent(new CustomEvent(HYDRATE_KEY));
});
if (!window[HYDRATE_KEY]) {
  if ("MutationObserver" in window) {
    new MutationObserver(notify).observe(document.body, { subtree: true, childList: true });
  }
  window[HYDRATE_KEY] = true;
}
export {
  notify
};
