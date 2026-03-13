export interface ExportBatch {
    type: "books" | "genres" | "publishers";
    data: unknown[];
    isLast: boolean;
}

export interface QueueMessage {
  jobId: string;
  type: "books" | "genres" | "publishers";
  offset: number;
}