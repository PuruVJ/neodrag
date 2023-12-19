import { Component, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { NeoDraggable } from '@neodrag/angular';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [NeoDraggable],
	template: `
		<div
			[neoDraggable]="{ position: position() }"
			(neoDrag)="position.set({ x: $event.offsetX, y: $event.offsetY })"
		>
			I can be moved with the slider too
		</div>
		X:
		<input
			type="range"
			min="0"
			max="300"
			[value]="position().x"
			(input)="position.set({ x: +$any($event.target).value, y: position().y })"
		/>

		Y:
		<input
			type="range"
			min="0"
			max="300"
			[value]="position().y"
			(input)="position.set({ y: +$any($event.target).value, x: position().x })"
		/>
	`,
})
class AppComponent {
	position = signal({ x: 0, y: 0 });
}

bootstrapApplication(AppComponent).catch((err) => console.error(err));
