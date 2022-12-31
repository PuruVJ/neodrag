import { DefaultTasksRunnerOptions } from './default-tasks-runner';
import { Batch } from './tasks-schedule';
import { BatchResults } from './batch/batch-messages';
import { Task } from '../config/task-graph';
export declare class ForkedProcessTaskRunner {
    private readonly options;
    workspaceRoot: string;
    cliPath: string;
    private readonly verbose;
    private processes;
    constructor(options: DefaultTasksRunnerOptions);
    forkProcessForBatch({ executorName, taskGraph }: Batch): Promise<BatchResults>;
    forkProcessPipeOutputCapture(task: Task, { streamOutput, temporaryOutputPath, }: {
        streamOutput: boolean;
        temporaryOutputPath: string;
    }): Promise<{
        code: number;
        terminalOutput: string;
    }>;
    forkProcessDirectOutputCapture(task: Task, { streamOutput, temporaryOutputPath, }: {
        streamOutput: boolean;
        temporaryOutputPath: string;
    }): Promise<{
        code: number;
        terminalOutput: string;
    }>;
    private readTerminalOutput;
    private writeTerminalOutput;
    private getEnvVariablesForProcess;
    private getEnvVariablesForTask;
    private getNxEnvVariablesForForkedProcess;
    private getNxEnvVariablesForTask;
    private getDotenvVariablesForForkedProcess;
    private getDotenvVariablesForTask;
    private signalToCode;
    private setupProcessEventListeners;
}
