export enum ExportJobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface ExportBatch {
  jobId: string;
  type: "books" | "genres" | "publishers";
  data: unknown[];
  isLast: boolean;
}

export interface QueueMessage {
  jobId: string;
  type: "books" | "genres" | "publishers";
  offset: number;
}

export interface ExportEnv {
    ENVIRONMENT: string;
    DB: D1Database;
    EXPORT_QUEUE: Queue;
    EXPORT_ASSEMBLER: DurableObjectNamespace;
    EXPORT_BUCKET: R2Bucket;
}