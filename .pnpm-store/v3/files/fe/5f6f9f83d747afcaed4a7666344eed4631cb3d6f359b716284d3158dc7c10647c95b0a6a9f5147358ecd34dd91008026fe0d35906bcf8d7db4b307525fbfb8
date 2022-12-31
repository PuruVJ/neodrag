(self.Astro = self.Astro || {}).visible = (getHydrateCallback, _opts, root) => {
  const cb = async () => {
    let hydrate = await getHydrateCallback();
    await hydrate();
  };
  let io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting)
        continue;
      io.disconnect();
      cb();
      break;
    }
  });
  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i];
    io.observe(child);
  }
};
window.dispatchEvent(new Event("astro:visible"));
