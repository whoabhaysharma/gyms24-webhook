import { Job } from 'bullmq';
import { QueueJobData } from '../types';
import * as WhatsAppService from '../services/whatsapp';
import * as BackendService from '../services/backend';

export const processJob = async (job: Job<QueueJobData>) => {
    const { type, payload } = job.data;

    if (type === 'incoming_message') {
        const entry = payload.entry[0];
        const changes = entry.changes[0];
        const value = changes.value;

        if (value.messages && value.messages.length > 0) {
            const message = value.messages[0];
            const from = message.from;
            const messageBody = message.text?.body || '';
            const name = value.contacts?.[0]?.profile?.name || 'Unknown';

            console.log(`Processing message from ${name} (${from}): ${messageBody}`);

            try {
                // 1. Mark as read
                await WhatsAppService.markAsRead(message.id);

                // 2. Send to Backend for processing
                const response = await BackendService.processUserMessage(from, messageBody, name);

                // 3. Send reply if backend returns one
                if (response && response.reply) {
                    await WhatsAppService.sendMessage(from, response.reply);
                }
            } catch (error) {
                console.error('Error processing job:', error);
                // Throwing error will cause BullMQ to retry based on config
                throw error;
            }
        }
    }
};
