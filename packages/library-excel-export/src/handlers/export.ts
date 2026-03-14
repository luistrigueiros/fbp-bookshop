import { type Context } from 'hono';
import { createRepositories, initDB } from "library-data-layer";
import { type Env } from "@/assembler";

export const handlePostExport = async (c: Context<{ Bindings: Env }>) => {
  const jobId = crypto.randomUUID();
  const db = initDB(c.env.DB);
  const repositories = createRepositories(db);
  
  // Create job record
  await repositories.exports.create({
    id: jobId,
    status: "pending",
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // Start queue chain with genres
  await c.env.EXPORT_QUEUE.send({
    jobId,
    type: "genres",
    offset: 0
  });
  
  return c.json({ jobId, status: "processing" });
};

export const handleGetStatusById = async (c: Context<{ Bindings: Env }>) => {
  const jobId = c.req.param('jobId');
  if (!jobId) return c.text("Job ID is required", 400);
  const db = initDB(c.env.DB);
  const repositories = createRepositories(db);
  const job = await repositories.exports.findById(jobId);
  
  if (!job) return c.text("Job not found", 404);
  return c.json(job);
};

export const handleGetStatus = async (c: Context<{ Bindings: Env }>) => {
  const db = initDB(c.env.DB);
  const repositories = createRepositories(db);
  const jobs = await repositories.exports.findAll();
  return c.json(jobs);
};

export const handleDownload = async (c: Context<{ Bindings: Env }>) => {
  const jobId = c.req.param('jobId');
  if (!jobId) return c.text("Job ID is required", 400);
  const blob = await c.env.EXPORT_BUCKET.get(`exports/${jobId}.xlsx`);
  if (!blob) return c.text("File not found", 404);
  
  const headers = new Headers();
  headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  headers.set("Content-Disposition", `attachment; filename="library_export_${jobId}.xlsx"`);
  
  // Convert body to ArrayBuffer to avoid DataCloneError in some environments (like miniflare proxy)
  const data = await blob.arrayBuffer();
  return new Response(data, {
    status: 200,
    headers
  });
};
