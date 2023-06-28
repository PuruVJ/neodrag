import { DOCUMENT } from '@angular/common';
import {
	DestroyRef,
	Directive,
	ElementRef,
	inject,
	Input,
	Output,
	EventEmitter,
} from '@angular/core';
import { Draggable, type DragEventData, type DragOptions } from '@neodrag/vanilla';

@Directive({ selector: '[neoDraggable]', standalone: true })
export class NeoDraggable {
	private _document = inject(DOCUMENT);
	private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);

	private _draggable: Draggable | null = null;

	// NOTE: '' type is to allow for using neoDraggable as-is without passing in any options
	@Input() set neoDraggable(options: DragOptions | '') {
		if (!this._document || !this._document.defaultView) {
			console.warn(`No browser API available.`);
			return;
		}

		if (this._draggable) {
			this._draggable.updateOptions(this._patchDragEvents(options || {}));
		} else {
			this._draggable = new Draggable(
				this._elRef.nativeElement,
				this._patchDragEvents(options || {})
			);
		}
	}

	@Output() neoDrag = new EventEmitter<DragEventData>();
	@Output() neoDragStart = new EventEmitter<DragEventData>();
	@Output() neoDragEnd = new EventEmitter<DragEventData>();

	constructor() {
		inject(DestroyRef).onDestroy(() => {
			this._draggable?.destroy();
			this._draggable = null;
		});
	}

	private _patchDragEvents(options: DragOptions) {
		for (const event of ['Drag', 'DragStart', 'DragEnd'] as const) {
			if (this[`neo${event}`].observed) {
				const original = options[`on${event}`];
				options[`on${event}`] = (data) => {
					original?.(data);
					this[`neo${event}`].emit(data);
				};
			}
		}
		return options;
	}
}

export type {
	DragAxis,
	DragBounds,
	DragBoundsCoords,
	DragEventData,
	DragOptions,
} from '@neodrag/vanilla';
