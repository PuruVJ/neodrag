import CssParseError from './CssParseError';
import Position from './CssPosition';
export declare enum CssTypes {
    stylesheet = "stylesheet",
    rule = "rule",
    declaration = "declaration",
    comment = "comment",
    charset = "charset",
    document = "document",
    customMedia = "custom-media",
    fontFace = "font-face",
    host = "host",
    import = "import",
    keyframes = "keyframes",
    keyframe = "keyframe",
    media = "media",
    namespace = "namespace",
    page = "page",
    supports = "supports"
}
export declare type CssCommonAST = {
    type: CssTypes;
};
export declare type CssCommonPositionAST = CssCommonAST & {
    position?: Position;
    parent?: unknown;
};
export declare type CssStylesheetAST = CssCommonAST & {
    type: CssTypes.stylesheet;
    stylesheet: {
        source?: string;
        rules: Array<CssAtRuleAST>;
        parsingErrors?: Array<CssParseError>;
    };
};
export declare type CssRuleAST = CssCommonPositionAST & {
    type: CssTypes.rule;
    selectors: Array<string>;
    declarations: Array<CssDeclarationAST | CssCommentAST>;
};
export declare type CssDeclarationAST = CssCommonPositionAST & {
    type: CssTypes.declaration;
    property: string;
    value: string;
};
export declare type CssCommentAST = CssCommonPositionAST & {
    type: CssTypes.comment;
    comment: string;
};
export declare type CssCharsetAST = CssCommonPositionAST & {
    type: CssTypes.charset;
    charset: string;
};
export declare type CssCustomMediaAST = CssCommonPositionAST & {
    type: CssTypes.customMedia;
    name: string;
    media: string;
};
export declare type CssDocumentAST = CssCommonPositionAST & {
    type: CssTypes.document;
    document: string;
    vendor?: string;
    rules: Array<CssAtRuleAST>;
};
export declare type CssFontFaceAST = CssCommonPositionAST & {
    type: CssTypes.fontFace;
    declarations: Array<CssDeclarationAST | CssCommentAST>;
};
export declare type CssHostAST = CssCommonPositionAST & {
    type: CssTypes.host;
    rules: Array<CssAtRuleAST>;
};
export declare type CssImportAST = CssCommonPositionAST & {
    type: CssTypes.import;
    import: string;
};
export declare type CssKeyframesAST = CssCommonPositionAST & {
    type: CssTypes.keyframes;
    name: string;
    vendor?: string;
    keyframes: Array<CssKeyframeAST | CssCommentAST>;
};
export declare type CssKeyframeAST = CssCommonPositionAST & {
    type: CssTypes.keyframe;
    values: Array<string>;
    declarations: Array<CssDeclarationAST | CssCommentAST>;
};
export declare type CssMediaAST = CssCommonPositionAST & {
    type: CssTypes.media;
    media: string;
    rules: Array<CssAtRuleAST>;
};
export declare type CssNamespaceAST = CssCommonPositionAST & {
    type: CssTypes.namespace;
    namespace: string;
};
export declare type CssPageAST = CssCommonPositionAST & {
    type: CssTypes.page;
    selectors: Array<string>;
    declarations: Array<CssDeclarationAST | CssCommentAST>;
};
export declare type CssSupportsAST = CssCommonPositionAST & {
    type: CssTypes.supports;
    supports: string;
    rules: Array<CssAtRuleAST>;
};
export declare type CssAtRuleAST = CssRuleAST | CssCommentAST | CssCharsetAST | CssCustomMediaAST | CssDocumentAST | CssFontFaceAST | CssHostAST | CssImportAST | CssKeyframesAST | CssMediaAST | CssNamespaceAST | CssPageAST | CssSupportsAST;
export declare type CssAllNodesAST = CssAtRuleAST | CssStylesheetAST | CssDeclarationAST | CssKeyframeAST;
