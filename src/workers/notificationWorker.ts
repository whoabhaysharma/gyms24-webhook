import { Worker } from 'bullmq';
import { connection } from '../queues/connection';
import { NOTIFICATION_QUEUE_NAME } from '../queues/notificationQueue';
import { sendMessage } from '../services/whatsapp';

export const notificationWorker = new Worker(
    NOTIFICATION_QUEUE_NAME,
    async (job) => {
        const { type, payload } = job.data;
        console.log(`Processing notification job ${job.id} of type ${type}`);

        try {
            if (type === 'WHATSAPP_ACCESS_CODE') {
                const { mobile, accessCode, gymName, planName, endDate } = payload;

                const message = `*Subscription Activated!* 🎉\n\n` +
                    `Gym: *${gymName}*\n` +
                    `Plan: *${planName}*\n` +
                    `Valid Until: *${new Date(endDate).toLocaleDateString()}*\n\n` +
                    `Your Access Code: *${accessCode}*\n\n` +
                    `Please show this code at the gym reception.`;

                await sendMessage(mobile, message);

                console.log(`WhatsApp notification sent for job ${job.id}`);
            }
        } catch (error) {
            console.error(`Notification job ${job.id} failed:`, error);
            throw error;
        }
    },
    {
        connection,
        concurrency: 5,
    }
);

notificationWorker.on('completed', (job) => {
    if (job) {
        console.log(`Notification Job ${job.id} completed!`);
    }
});

notificationWorker.on('failed', (job, err) => {
    if (job) {
        console.error(`Notification Job ${job.id} failed with ${err.message}`);
    }
});
