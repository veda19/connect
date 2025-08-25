import { createBroadcastJob, getJobStatus } from "../queue/broadcastQueue.js";

export async function broadcastMessage(req, res) {
  const { numbers, message } = req.body;

  if (!Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ error: "Numbers array is required" });
  }

  const jobId = createBroadcastJob(numbers, message);
  res.json({ jobId, message: "Broadcast started" });
}

export async function getBroadcastStatus(req, res) {
  const { jobId } = req.params;
  const status = getJobStatus(jobId);
  res.json(status);
}
