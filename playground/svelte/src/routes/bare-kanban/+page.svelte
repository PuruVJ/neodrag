<script lang="ts">
	import { Draggable, ghost } from '@neodrag/svelte';
	import { events } from '@neodrag/svelte/plugins';
	import { Droppable } from '@neodrag/svelte/drop';

	let tasks = $state([
		{ id: '1', title: 'Task 1', column: 'todo' },
		{ id: '2', title: 'Task 2', column: 'todo' },
		{ id: '3', title: 'Task 3', column: 'done' },
	]);

	let draggedTask = $state(null);

	function getTasksForColumn(columnId) {
		return tasks.filter((task) => task.column === columnId);
	}

	function startDrag(task) {
		draggedTask = task;
		console.log('DRAG START:', task.id);
	}

	function endDrag() {
		// Delay clearing draggedTask to allow onDrop to process first
		setTimeout(() => {
			draggedTask = null;
			console.log('DRAG END');
		}, 0);
	}

	function dropInColumn(columnId) {
		console.log('DROP ATTEMPT:', draggedTask?.id, 'to', columnId);
		if (draggedTask && draggedTask.column !== columnId) {
			console.log('ACTUAL DROP:', draggedTask.id, 'from', draggedTask.column, 'to', columnId);
			// Direct mutation works in Svelte 5
			const task = tasks.find((t) => t.id === draggedTask!.id);
			if (task) {
				task.column = columnId;
				console.log('UPDATED TASK:', task);
			}
		} else {
			console.log('SAME COLUMN DROP - NO CHANGE NEEDED');
		}
	}

	const drag_0 = new Draggable({
		plugins: [
			ghost({ opacity: 0.2 }),
			events({
				onDragStart() {
					startDrag(task);
				},
				onDragEnd() {
					endDrag();
				},
			}),
		],
	});
	const drop_1 = new Droppable({
		plugins: [
			{
				onDrop() {
					dropInColumn('todo');
				},
			},
		],
	});
	const drop_2 = new Droppable({
		plugins: [
			{
				onDrop() {
					console.log(2);
					dropInColumn('done');
				},
			},
		],
	});

	const drop_0 = new Droppable({
		plugins: [
			{
				onDrop() {
					console.log(2);
					dropInColumn('done');
				},
			},
		],
	});
</script>

<h1>Bare Kanban</h1>

<div style="display: flex; gap: 20px;">
	<div
		style="border: 1px solid black; width: 200px; min-height: 300px; padding: 10px;"
		{@attach drop_1.attachment}
	>
		<h2>TODO</h2>
		{#each getTasksForColumn('todo') as task (task.id)}
			<div
				style="border: 1px solid red; padding: 5px; margin: 5px 0; background: white;"
				{@attach drag_0.attachment}
			>
				{task.title}
			</div>
		{/each}
	</div>

	<div
		style="border: 1px solid black; width: 200px; min-height: 300px; padding: 10px;"
		{@attach drop_0.attachment}
	>
		<h2>DONE</h2>
		{#each getTasksForColumn('done') as task (task.id)}
			<div
				style="border: 1px solid green; padding: 5px; margin: 5px 0; background: white;"
				{@attach drag_0.attachment}
			>
				{task.title}
			</div>
		{/each}
	</div>
</div>

<p>Dragging: {draggedTask?.title || 'none'}</p>
<p>Tasks: {JSON.stringify(tasks)}</p>
