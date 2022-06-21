import { DragOptions } from '.';
import 'solid-js';

declare module 'solid-js' {
	namespace JSX {
		interface Directives {
			draggable: DragOptions;
		}
	}
}
