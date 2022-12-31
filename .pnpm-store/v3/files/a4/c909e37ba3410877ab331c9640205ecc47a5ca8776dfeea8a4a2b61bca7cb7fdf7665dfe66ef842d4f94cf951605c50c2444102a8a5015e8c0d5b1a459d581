import { TaskGraph } from '../../config/task-graph';
export declare enum BatchMessageType {
    Tasks = 0,
    Complete = 1
}
export interface BatchTasksMessage {
    type: BatchMessageType.Tasks;
    executorName: string;
    taskGraph: TaskGraph;
}
/**
 * Results of running the batch. Mapped from task id to results
 */
export interface BatchResults {
    [taskId: string]: {
        success: boolean;
        terminalOutput?: string;
    };
}
export interface BatchCompleteMessage {
    type: BatchMessageType.Complete;
    results: BatchResults;
}
export declare type BatchMessage = BatchTasksMessage | BatchCompleteMessage;
