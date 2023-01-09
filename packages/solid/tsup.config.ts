import { coreConfig } from '@neodrag/tsup-config';

export default coreConfig({
	dtsBanner: `import 'solid-js';

declare module 'solid-js' {
    namespace JSX {
        interface Directives {
            draggable: DragOptions;
        }
    }
}
`,
});
