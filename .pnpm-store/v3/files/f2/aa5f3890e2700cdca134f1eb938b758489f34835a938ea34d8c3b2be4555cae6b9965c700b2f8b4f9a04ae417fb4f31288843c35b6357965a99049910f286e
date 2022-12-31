export const copyText = async (text) => {
    if ('clipboard' in navigator) {
        await navigator.clipboard.writeText(text);
    }
    else {
        /**
         * This is the fallback deprecated way of copying text to the clipboard. Only runs if it can't find the clipboard API.
         */
        const element = document.createElement('input');
        element.type = 'text';
        element.disabled = true;
        element.style.setProperty('position', 'fixed');
        element.style.setProperty('z-index', '-100');
        element.style.setProperty('pointer-events', 'none');
        element.style.setProperty('opacity', '0');
        element.value = text;
        document.body.appendChild(element);
        element.click();
        element.select();
        document.execCommand('copy');
        document.body.removeChild(element);
    }
};
export const copy = (element, params) => {
    async function handle() {
        if (text)
            try {
                await copyText(text);
                element.dispatchEvent(new CustomEvent('svelte-copy', { detail: text }));
            }
            catch (e) {
                element.dispatchEvent(new CustomEvent('svelte-copy:error', { detail: e }));
            }
    }
    let events = typeof params == 'string' ? ['click'] : [params.events].flat(1);
    let text = typeof params == 'string' ? params : params.text;
    events.forEach((event) => {
        element.addEventListener(event, handle, true);
    });
    return {
        update: (newParams) => {
            const newEvents = typeof newParams == 'string' ? ['click'] : [newParams.events].flat(1);
            const newText = typeof newParams == 'string' ? newParams : newParams.text;
            const addedEvents = newEvents.filter((x) => !events.includes(x));
            const removedEvents = events.filter((x) => !newEvents.includes(x));
            addedEvents.forEach((event) => {
                element.addEventListener(event, handle, true);
            });
            removedEvents.forEach((event) => {
                element.removeEventListener(event, handle, true);
            });
            events = newEvents;
            text = newText;
        },
        destroy: () => {
            events.forEach((event) => {
                element.removeEventListener(event, handle, true);
            });
        },
    };
};
