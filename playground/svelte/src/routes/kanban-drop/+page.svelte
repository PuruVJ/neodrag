<script lang="ts">
	import { draggable, ghost } from '@neodrag/svelte';
	import { droppable } from '@neodrag/svelte/drop';
	
	interface Task {
		id: string;
		title: string;
		description: string;
		category: string;
	}
	
	interface Column {
		id: string;
		title: string;
		color: string;
	}
	
	const columns: Column[] = [
		{ id: 'todo', title: 'To Do', color: '#ef4444' },
		{ id: 'progress', title: 'In Progress', color: '#f59e0b' },
		{ id: 'review', title: 'Review', color: '#8b5cf6' },
		{ id: 'done', title: 'Done', color: '#10b981' }
	];
	
	let tasks = $state<Task[]>([
		{ id: '1', title: 'Design landing page', description: 'Create wireframes and mockups', category: 'todo' },
		{ id: '2', title: 'Implement authentication', description: 'Set up user login/logout', category: 'todo' },
		{ id: '3', title: 'Build dashboard', description: 'Create main user dashboard', category: 'progress' },
		{ id: '4', title: 'Write tests', description: 'Add unit and integration tests', category: 'progress' },
		{ id: '5', title: 'Code review', description: 'Review pull request #123', category: 'review' },
		{ id: '6', title: 'Deploy to staging', description: 'Push changes to staging environment', category: 'done' }
	]);
	
	let draggedTask: Task | null = $state(null);
	let dropFeedback = $state('');
	let feedbackTimeout: ReturnType<typeof setTimeout> | null = null;
	let hoveredColumn: string | null = $state(null);
	
	function getTasksForColumn(columnId: string) {
		return tasks.filter(task => task.category === columnId);
	}
	
	function handleTaskDragStart(task: Task) {
		draggedTask = task;
		console.log('DRAG START:', task.id, task.title, 'from', task.category);
	}
	
	function handleTaskDragEnd() {
		console.log('DRAG END:', draggedTask?.id);
		// Delay clearing draggedTask to allow drop event to process first
		setTimeout(() => {
			draggedTask = null;
			dropFeedback = '';
			hoveredColumn = null;
			if (feedbackTimeout) {
				clearTimeout(feedbackTimeout);
				feedbackTimeout = null;
			}
		}, 0);
	}
	
	function handleColumnEnter(columnId: string) {
		if (draggedTask && draggedTask.category !== columnId) {
			if (feedbackTimeout) clearTimeout(feedbackTimeout);
			hoveredColumn = columnId;
			dropFeedback = `Drop to move "${draggedTask.title}" to ${columns.find(c => c.id === columnId)?.title}`;
		}
	}
	
	function handleColumnLeave() {
		if (feedbackTimeout) clearTimeout(feedbackTimeout);
		feedbackTimeout = setTimeout(() => {
			dropFeedback = '';
			hoveredColumn = null;
			feedbackTimeout = null;
		}, 100);
	}
	
	function handleColumnDrop(columnId: string) {
		console.log('DROP EVENT:', {
			columnId,
			draggedTask: draggedTask?.id,
			draggedTaskCategory: draggedTask?.category
		});
		
		if (draggedTask && draggedTask.category !== columnId) {
			const task = tasks.find(t => t.id === draggedTask!.id);
			if (task) {
				console.log('DROP: Moving task', draggedTask.id, 'from', draggedTask.category, 'to', columnId);
				// Direct mutation works in Svelte 5
				task.category = columnId;
				dropFeedback = `Moved "${draggedTask.title}" to ${columns.find(c => c.id === columnId)?.title}!`;
				console.log('DROP: Task moved, updated task:', task);
				console.log('DROP: All tasks after update:', tasks);
			} else {
				console.log('DROP: Task not found in tasks array');
			}
		} else {
			console.log('DROP: No draggedTask or same column');
		}
	}
</script>

<div class="kanban-board">
	<h1>Kanban Board - Drag & Drop Demo</h1>
	
	{#if dropFeedback}
		<div class="feedback" class:success={dropFeedback.includes('Moved')}>
			{dropFeedback}
		</div>
	{/if}
	
	<div class="columns">
		{#each columns as column (column.id)}
			<div 
				class="column"
				class:drop-hover={hoveredColumn === column.id}
				{@attach droppable([
					{
						name: 'kanban-column',
						onEnter() {
							handleColumnEnter(column.id);
						},
						onLeave() {
							handleColumnLeave();
						},
						onDrop() {
							handleColumnDrop(column.id);
						}
					}
				])}
			>
				<div class="column-header" style="background-color: {column.color}">
					<h3>{column.title}</h3>
					<span class="task-count">{getTasksForColumn(column.id).length}</span>
				</div>
				
				<div class="column-content">
					{#each getTasksForColumn(column.id) as task (task.id)}
						<div 
							class="task-card"
							{@attach draggable([
								ghost({ opacity: 0.7 }),
								{
									name: 'kanban-task',
									start() {
										handleTaskDragStart(task);
									},
									end() {
										handleTaskDragEnd();
									}
								}
							])}
						>
							<div class="task-header">
								<h4>{task.title}</h4>
								<div class="task-id">#{task.id}</div>
							</div>
							<p class="task-description">{task.description}</p>
							<div class="task-category" style="background-color: {column.color}">
								{column.title}
							</div>
						</div>
					{/each}
					
					{#if getTasksForColumn(column.id).length === 0}
						<div class="empty-column">
							<p>No tasks yet</p>
							<span>Drop tasks here</span>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
	
	<div class="stats">
		<div class="stat">
			<span class="stat-value">{tasks.length}</span>
			<span class="stat-label">Total Tasks</span>
		</div>
		<div class="stat">
			<span class="stat-value">{getTasksForColumn('done').length}</span>
			<span class="stat-label">Completed</span>
		</div>
		<div class="stat">
			<span class="stat-value">{Math.round((getTasksForColumn('done').length / tasks.length) * 100)}%</span>
			<span class="stat-label">Progress</span>
		</div>
	</div>
</div>

<style>
	.kanban-board {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
		font-family: system-ui, sans-serif;
	}
	
	h1 {
		text-align: center;
		color: #1f2937;
		margin-bottom: 2rem;
		font-size: 2.5rem;
		font-weight: 700;
	}
	
	.feedback {
		background: #dbeafe;
		border: 1px solid #93c5fd;
		color: #1e40af;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		text-align: center;
		font-weight: 500;
		transition: all 0.3s ease;
	}
	
	.feedback.success {
		background: #d1fae5;
		border-color: #86efac;
		color: #065f46;
	}
	
	.columns {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}
	
	.column {
		background: #f9fafb;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		min-height: 500px;
	}
	
	.column:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
	
	.column.drop-hover {
		transform: scale(1.02);
		box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
		border: 2px solid #3b82f6;
	}
	
	.column-header {
		padding: 1rem 1.5rem;
		color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.column-header h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}
	
	.task-count {
		background: rgba(255, 255, 255, 0.2);
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.875rem;
		font-weight: 600;
	}
	
	.column-content {
		padding: 1rem;
		min-height: 400px;
	}
	
	.task-card {
		background: white;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		cursor: move;
		transition: all 0.2s ease;
		border: 2px solid transparent;
	}
	
	.task-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transform: translateY(-1px);
	}
	
	
	.task-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}
	
	.task-header h4 {
		margin: 0;
		color: #1f2937;
		font-size: 1rem;
		font-weight: 600;
	}
	
	.task-id {
		background: #f3f4f6;
		color: #6b7280;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
	}
	
	.task-description {
		color: #6b7280;
		margin: 0.5rem 0;
		font-size: 0.875rem;
		line-height: 1.4;
	}
	
	.task-category {
		display: inline-block;
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.empty-column {
		text-align: center;
		padding: 3rem 1rem;
		color: #9ca3af;
	}
	
	.empty-column p {
		margin: 0 0 0.5rem 0;
		font-size: 1.125rem;
		font-weight: 500;
	}
	
	.empty-column span {
		font-size: 0.875rem;
	}
	
	.stats {
		display: flex;
		justify-content: center;
		gap: 3rem;
		padding: 2rem;
		background: #f9fafb;
		border-radius: 12px;
		border: 2px dashed #d1d5db;
	}
	
	.stat {
		text-align: center;
	}
	
	.stat-value {
		display: block;
		font-size: 2rem;
		font-weight: 700;
		color: #1f2937;
		line-height: 1;
	}
	
	.stat-label {
		display: block;
		font-size: 0.875rem;
		color: #6b7280;
		margin-top: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}
</style>