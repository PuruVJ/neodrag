import { writable, get } from 'svelte/store';
import clsx from 'clsx';
/**
 * Svelte action to change class on `body`
 *
 * You can pass a string or object, or an array of combination of these. Literally anything that [clsx](https://github.com/lukeed/clsx) accepts.
 *
 * @example
 *
 *```svelte
 * <script>
 *   import { classList } from 'svelte-body';
 *
 *   let isBlue = true;
 * </script>
 *
 * <svelte:body use:classList={"red green blue"} />
 * <svelte:body use:classList={{ red: true, blue: isBlue }} />
 * <svelte:body use:classList={['red', isBlue && 'blue']} />
 * <svelte:body use:classList={[ 'red', { blue: isBlue } ]} />
 *```
 */
export const classList = (node, classString = '') => {
    const classes = writable(clsx(classString).split(' ').filter(Boolean));
    // When the classes store changes add the new classes
    const unsubscribe = classes.subscribe((list) => {
        if (Array.isArray(list) && list?.length)
            node.classList.add(...list);
    });
    // Remove all classes that we added
    const unset = () => node.classList.remove(...get(classes));
    return {
        update: (classString = '') => {
            unset();
            classes.set(clsx(classString).split(' ').filter(Boolean));
        },
        destroy: () => {
            unset();
            unsubscribe();
        },
    };
};
/**
 * Svelte action to add style on `body`. style can either be a string or an object.
 *
 * @example
 *
 *```svelte
 * <script>
 *   import { style } from 'svelte-body';
 * </script>
 *
 * <svelte:body use:style={"background-color: blue;"} />
 * <svelte:body use:style={{ backgroundColor: 'blue' }} />
 *```
 */
export const style = (node, styleData = {}) => {
    // Pseudo Element for style parsing and keeping track of styles
    const pseudoElement = document.createElement('div');
    const update = (styleData = {}) => {
        if (typeof styleData == 'string')
            pseudoElement.style.cssText = styleData;
        if (typeof styleData == 'object')
            for (const [property, value] of Object.entries(styleData)) {
                // Do a setProperty in case it's a CSS variable
                if (property.startsWith('--')) {
                    pseudoElement.style.setProperty(property, value);
                }
                else {
                    pseudoElement.style[property] = value;
                }
            }
        // Combine body's existing styles with computed ones
        node.style.cssText = `
					${node.style.cssText};
					${pseudoElement.style.cssText};
				`;
    };
    // Initial Update
    update(styleData);
    const unset = () => {
        // Remove the pseudoElements styles on the body
        node.style.cssText = node.style.cssText.replace(pseudoElement.style.cssText, '');
        // Clear pseudoElement
        pseudoElement.style.cssText = '';
    };
    return {
        update: (styleData) => {
            unset();
            update(styleData);
        },
        destroy: unset,
    };
};
