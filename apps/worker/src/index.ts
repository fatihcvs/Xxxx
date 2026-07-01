import { Queue, Worker, type ConnectionOptions } from "bullmq";
import { runHeartbeat } from "./heartbeat";

const HEARTBEAT_QUEUE = "world-heartbeat";
const HEARTBEAT_EVERY_MS = Number(process.env.HEARTBEAT_EVERY_MS ?? 5 * 60 * 1000);

function redisConnection(): ConnectionOptions {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  return { url } as unknown as ConnectionOptions;
}

/** Run a single heartbeat sweep and exit (no Redis needed). Useful for cron/testing. */
async function runOnce(): Promise<void> {
  const result = await runHeartbeat();
  console.log("[heartbeat:once]", result);
  process.exit(0);
}

/** Long-running worker: schedules a repeatable heartbeat via BullMQ + Redis. */
async function runDaemon(): Promise<void> {
  const connection = redisConnection();

  const queue = new Queue(HEARTBEAT_QUEUE, { connection });
  await queue.add(
    "tick",
    {},
    {
      repeat: { every: HEARTBEAT_EVERY_MS },
      removeOnComplete: true,
      removeOnFail: 100,
    },
  );

  const worker = new Worker(
    HEARTBEAT_QUEUE,
    async () => {
      const result = await runHeartbeat();
      console.log("[heartbeat]", new Date().toISOString(), result);
      return result;
    },
    { connection },
  );

  worker.on("failed", (job, err) => {
    console.error("[heartbeat:failed]", job?.id, err.message);
  });

  console.log(`Worker started. Heartbeat every ${HEARTBEAT_EVERY_MS}ms on "${HEARTBEAT_QUEUE}".`);

  const shutdown = async () => {
    await worker.close();
    await queue.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

if (process.argv.includes("--once")) {
  void runOnce();
} else {
  void runDaemon();
}
