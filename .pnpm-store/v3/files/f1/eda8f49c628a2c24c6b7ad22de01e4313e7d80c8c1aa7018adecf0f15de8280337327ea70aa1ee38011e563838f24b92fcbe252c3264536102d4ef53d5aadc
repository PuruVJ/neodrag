(self.Astro = self.Astro || {}).idle = (getHydrateCallback) => {
  const cb = async () => {
    let hydrate = await getHydrateCallback();
    await hydrate();
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(cb);
  } else {
    setTimeout(cb, 200);
  }
};
window.dispatchEvent(new Event("astro:idle"));
