import { Worker } from 'bullmq';
import { connection } from '../queues/connection';
import { QUEUE_NAME } from '../queues/messageQueue';
import { processJob } from './processor';
import dotenv from 'dotenv';

dotenv.config();

console.log('Starting worker...');

const worker = new Worker(QUEUE_NAME, processJob, {
    connection,
    concurrency: 5, // Adjust based on load
});

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with ${err.message}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing worker');
    await worker.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing worker');
    await worker.close();
    process.exit(0);
});
