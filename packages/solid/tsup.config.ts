import { core_config } from '../config';

export default core_config({
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
