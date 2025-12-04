import { FastifyInstance } from 'fastify';
import { verifyWebhook } from './validator';
import { addMessageToQueue } from '../queues/messageQueue';
import { WhatsAppMessage } from '../types';

export default async function routes(fastify: FastifyInstance) {

    // Verification Endpoint
    fastify.get('/webhook', async (request, reply) => {
        return verifyWebhook(request, reply);
    });

    // Ingestion Endpoint
    fastify.post('/webhook', async (request, reply) => {
        // Basic validation
        // TODO: Add strict signature verification middleware here

        const body = request.body as WhatsAppMessage;

        console.log('Received webhook:', JSON.stringify(body, null, 2));

        if (body.object) {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                // Valid message, add to queue
                try {
                    await addMessageToQueue(body);
                    console.log('Message added to queue');
                    return reply.status(200).send('EVENT_RECEIVED');
                } catch (error) {
                    console.error('Error adding to queue:', error);
                    return reply.status(500).send('Internal Server Error');
                }
            } else {
                // Not a message event (e.g., status update), just ack
                return reply.status(200).send('EVENT_RECEIVED');
            }
        } else {
            return reply.status(404).send();
        }
    });

    // Health check
    fastify.get('/health', async () => {
        return { status: 'ok' };
    });

    // Send Message Endpoint
    fastify.post('/messages', async (request, reply) => {
        const body = request.body as any; // Simple validation for now, ideally use Zod

        if (!body.to || !body.message) {
            return reply.status(400).send({ error: 'Missing "to" or "message" field' });
        }

        try {
            // Lazy load service to avoid circular deps if any (though none here)
            const { sendMessage } = await import('../services/whatsapp');
            const response = await sendMessage(body.to, body.message);
            return reply.status(200).send(response);
        } catch (error: any) {
            console.error('Error sending message:', error);
            return reply.status(500).send({ error: error.message || 'Internal Server Error' });
        }
    });
}
