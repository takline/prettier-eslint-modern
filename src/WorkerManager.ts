/* eslint-disable @typescript-eslint/no-explicit-any */
import { Worker } from 'worker_threads';
import { logError, logInfo } from './errorHandler';

export class WorkerManager {
    workerPath: string;
    worker: Worker | null;
    requestId: number;
    pendingRequests: Map<number, { resolve: (value: any) => void, reject: (reason?: any) => void }>;

    constructor(workerPath: string) {
        this.workerPath = workerPath;
        this.worker = null;
        this.requestId = 0;
        this.pendingRequests = new Map();
    }

    start() {
        if (this.worker) return;

        logInfo(`[WorkerManager] Starting worker: ${this.workerPath}`);
        try {
            this.worker = new Worker(this.workerPath);
            this.worker.on('message', this.handleMessage.bind(this));
            this.worker.on('error', this.handleError.bind(this));
            this.worker.on('exit', this.handleExit.bind(this));
            logInfo('[WorkerManager] Worker started.');
        } catch (e: unknown) {
            logError(`[WorkerManager] Failed to start worker: ${e instanceof Error ? e.message : String(e)}`);
            throw e;
        }
    }

    handleMessage(message: any) {
        if (message.type === 'log') {
            logInfo(message.message);
            return;
        }
        const { id, result, error } = message;
        if (this.pendingRequests.has(id)) {
            const { resolve, reject } = this.pendingRequests.get(id)!;
            this.pendingRequests.delete(id);
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        }
    }

    handleError(error: Error) {
        logError(`[WorkerManager] Worker error: ${error.message}`);
        // Reject all pending requests
        for (const [, { reject }] of this.pendingRequests) {
            reject(error);
        }
        this.pendingRequests.clear();
        this.worker = null; // Needs restart
    }

    handleExit(code: number) {
        logInfo(`[WorkerManager] Worker exited with code ${code}`);
        if (code !== 0) {
             const error = new Error(`Worker stopped with exit code ${code}`);
             for (const [, { reject }] of this.pendingRequests) {
                reject(error);
            }
            this.pendingRequests.clear();
        }
        this.worker = null;
    }

    format(data: any): Promise<string> {
        this.start(); // Ensure started

        return new Promise((resolve, reject) => {
            if (!this.worker) {
                reject(new Error('Worker not available'));
                return;
            }
            const id = ++this.requestId;
            this.pendingRequests.set(id, { resolve, reject });
            this.worker.postMessage({ id, data });
        });
    }
}
