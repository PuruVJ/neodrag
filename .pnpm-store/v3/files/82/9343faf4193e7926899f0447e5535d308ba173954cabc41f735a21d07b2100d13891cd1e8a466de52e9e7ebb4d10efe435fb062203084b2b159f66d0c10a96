import { iconToSVG } from '../svg/build.mjs';
import { getIconData } from '../icon-set/get-icon.mjs';
import { mergeIconProps } from './utils.mjs';
import createDebugger from 'debug';
import { defaultIconCustomisations } from '../customisations/defaults.mjs';
import '../icon/defaults.mjs';
import '../svg/size.mjs';
import '../icon/merge.mjs';
import '../icon/transformations.mjs';
import '../icon-set/tree.mjs';

const debug = createDebugger("@iconify-loader:icon");
async function searchForIcon(iconSet, collection, ids, options) {
  let iconData;
  const { customize } = options?.customizations ?? {};
  for (const id of ids) {
    iconData = getIconData(iconSet, id);
    if (iconData) {
      debug(`${collection}:${id}`);
      let defaultCustomizations = { ...defaultIconCustomisations };
      if (typeof customize === "function")
        defaultCustomizations = customize(defaultCustomizations);
      const {
        attributes: { width, height, ...restAttributes },
        body
      } = iconToSVG(iconData, defaultCustomizations);
      const scale = options?.scale;
      return await mergeIconProps(
        `<svg >${body}</svg>`,
        collection,
        id,
        options,
        () => {
          return { ...restAttributes };
        },
        (props) => {
          if (typeof props.width === "undefined" || props.width === null) {
            if (typeof scale === "number") {
              props.width = `${scale}em`;
            } else {
              props.width = width;
            }
          }
          if (typeof props.height === "undefined" || props.height === null) {
            if (typeof scale === "number") {
              props.height = `${scale}em`;
            } else {
              props.height = height;
            }
          }
        }
      );
    }
  }
}

export { searchForIcon };
