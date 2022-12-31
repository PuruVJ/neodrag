import throttles from "throttles";
import "../@types/network-information.d.ts";
import requestIdleCallback from "./requestIdleCallback.js";
const events = ["mouseenter", "touchstart", "focus"];
const preloaded = /* @__PURE__ */ new Set();
const loadedStyles = /* @__PURE__ */ new Set();
function shouldPreload({ href }) {
  try {
    const url = new URL(href);
    return window.location.origin === url.origin && window.location.pathname !== url.pathname && !preloaded.has(href);
  } catch {
  }
  return false;
}
let parser;
let observer;
function observe(link) {
  preloaded.add(link.href);
  observer.observe(link);
  events.map((event) => link.addEventListener(event, onLinkEvent, { passive: true, once: true }));
}
function unobserve(link) {
  observer.unobserve(link);
  events.map((event) => link.removeEventListener(event, onLinkEvent));
}
function onLinkEvent({ target }) {
  if (!(target instanceof HTMLAnchorElement)) {
    return;
  }
  preloadHref(target);
}
async function preloadHref(link) {
  unobserve(link);
  const { href } = link;
  try {
    const contents = await fetch(href).then((res) => res.text());
    parser || (parser = new DOMParser());
    const html = parser.parseFromString(contents, "text/html");
    const styles = Array.from(html.querySelectorAll('link[rel="stylesheet"]'));
    await Promise.all(
      styles.filter((el) => !loadedStyles.has(el.href)).map((el) => {
        loadedStyles.add(el.href);
        return fetch(el.href);
      })
    );
  } catch {
  }
}
function prefetch({
  selector = 'a[href][rel~="prefetch"]',
  throttle = 1
}) {
  if (!navigator.onLine) {
    return Promise.reject(new Error("Cannot prefetch, no network connection"));
  }
  if ("connection" in navigator) {
    const connection = navigator.connection;
    if (connection.saveData) {
      return Promise.reject(new Error("Cannot prefetch, Save-Data is enabled"));
    }
    if (/(2|3)g/.test(connection.effectiveType)) {
      return Promise.reject(new Error("Cannot prefetch, network conditions are poor"));
    }
  }
  const [toAdd, isDone] = throttles(throttle);
  observer = observer || new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target instanceof HTMLAnchorElement) {
        toAdd(() => preloadHref(entry.target).finally(isDone));
      }
    });
  });
  requestIdleCallback(() => {
    const links = [...document.querySelectorAll(selector)].filter(shouldPreload);
    links.forEach(observe);
  });
}
export {
  prefetch as default
};
