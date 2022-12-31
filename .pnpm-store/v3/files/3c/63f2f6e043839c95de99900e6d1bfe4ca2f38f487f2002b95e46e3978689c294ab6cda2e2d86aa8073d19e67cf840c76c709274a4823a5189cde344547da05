import { Fragment, Renderer } from '../runtime/server/index.js';
declare const AstroJSX = "astro:jsx";
export interface AstroVNode {
    [Renderer]: string;
    [AstroJSX]: boolean;
    type: string | ((...args: any) => any);
    props: Record<string | symbol, any>;
}
export declare function isVNode(vnode: any): vnode is AstroVNode;
export declare function transformSlots(vnode: AstroVNode): AstroVNode | undefined;
declare function createVNode(type: any, props: Record<string, any>): AstroVNode;
export { AstroJSX, createVNode as jsx, createVNode as jsxs, createVNode as jsxDEV, Fragment };
