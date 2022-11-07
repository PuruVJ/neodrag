export const browser = !import.meta.env.SSR;

export const isMac = browser && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
export const isMobile =
	browser && navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);
export const isDesktop = !isMobile;
