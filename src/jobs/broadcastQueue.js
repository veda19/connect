import PQueue from "p-queue";
import { sendTemplateMessage } from "../services/whatsappService.js";
import { whatsappConfig } from "../config/whatsappConfig.js";

// Job store (in-memory for now)
const jobs = new Map();

export function createBroadcastJob(numbers, message) {
  const jobId = Date.now().toString(); // simple unique id
  jobs.set(jobId, {
    status: "pending",
    total: numbers.length,
    completed: 0,
    results: [], // success/failure logs per number
  });

  const queue = new PQueue({
    concurrency: whatsappConfig.concurrency,
    interval: whatsappConfig.throttleMs,
    intervalCap: 1,
  });

  numbers.forEach((number) => {
    queue.add(async () => {
      try {
        const response = await sendTemplateMessage(number, message);
        jobs.get(jobId).results.push({
          number,
          status: "success",
          response,
        });
      } catch (err) {
        jobs.get(jobId).results.push({
          number,
          status: "error",
          error: err.message,
        });
      } finally {
        const job = jobs.get(jobId);
        job.completed++;
        if (job.completed === job.total) {
          job.status = "completed";
        }
      }
    });
  });

  queue.onIdle().then(() => {
    const job = jobs.get(jobId);
    if (job && job.status !== "completed") {
      job.status = "completed";
    }
  });

  return jobId;
}

export function getJobStatus(jobId) {
  return jobs.get(jobId) || { error: "Job not found" };
}
