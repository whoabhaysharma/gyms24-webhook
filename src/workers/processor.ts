import { Job } from 'bullmq';
import { QueueJobData } from '../types';
import * as WhatsAppService from '../services/whatsapp';
import * as BackendService from '../services/backend';

export const processJob = async (job: Job<QueueJobData>) => {
    const { type, payload } = job.data;
    console.log(type, payload, 'JOB')

    if (type === 'incoming_message') {
        const entry = payload.entry[0];
        const changes = entry.changes[0];
        const value = changes.value;

        if (value.messages && value.messages.length > 0) {
            const message = value.messages[0];
            const from = message.from;
            const name = value.contacts?.[0]?.profile?.name || 'Unknown';

            console.log(`[Processor] Processing message from ${name} (${from})`);

            try {
                // 1. Mark as read
                await WhatsAppService.markAsRead(message.id);

                // 2. Handle Interactive Button Replies
                if (message.type === 'interactive' && message.interactive.type === 'button_reply') {
                    const buttonId = message.interactive.button_reply.id;
                    console.log(`[Processor] Received button click: ${buttonId}`);

                    if (buttonId === 'book_membership') {
                        // Generate Magic Link
                        const magicLink = await BackendService.getMagicLink(from);
                        if (magicLink) {
                            await WhatsAppService.sendMessage(from, `Here is your link to book a membership:\n${magicLink}\n\nThis link is valid for 15 minutes.`);
                        } else {
                            await WhatsAppService.sendMessage(from, 'Sorry, we could not generate a booking link at this time. Please try again later.');
                        }
                    } else if (buttonId === 'my_memberships') {
                        // Fetch User & Subscriptions
                        const user = await BackendService.getUserByMobile(from);
                        if (!user) {
                            await WhatsAppService.sendMessage(from, 'We could not find an account associated with this number. Please book a membership first!');
                        } else {
                            const subscriptions = await BackendService.getSubscriptions(user.id);
                            if (subscriptions.length > 0) {
                                let response = `*Active Memberships for ${name}:*\n\n`;
                                subscriptions.forEach((sub: any) => {
                                    response += `🏋️ *${sub.gym.name}* - ${sub.plan.name}\n📅 Ends: ${new Date(sub.endDate).toLocaleDateString()}\n🔑 Access Code: *${sub.accessCode}*\n\n`;
                                });
                                await WhatsAppService.sendMessage(from, response);
                            } else {
                                await WhatsAppService.sendMessage(from, 'You have no active memberships.');
                            }
                        }
                    }
                    return;
                }

                // 3. Handle Text Messages (Greetings)
                if (message.type === 'text' && message.text) {
                    const messageBody = message.text.body.toLowerCase();
                    console.log(`[Processor] Received text message: "${messageBody}"`);
                    const greetings = ['hi', 'hello', 'start', 'hey', 'hola'];

                    console.log(messageBody, "input message");
                    if (greetings.some(greet => messageBody.includes(greet))) {
                        console.log(`[Processor] Greeting detected. Sending interactive menu.`);
                        await WhatsAppService.sendInteractiveButtons(
                            from,
                            `Welcome to Gyms24, ${name}! 🏋️‍♂️\n\nYour complete gym booking platform. How can we help you today?`,
                            [
                                { id: 'book_membership', title: 'Book Membership' },
                                { id: 'my_memberships', title: 'My Memberships' }
                            ]
                        );
                        return;
                    }
                }

                // 4. Default / Fallback (Optional: Send to backend for NLP or other processing)
                // For now, we can just ignore or send a generic "I didn't understand" if needed.
                // Keeping existing backend call for other messages if desired, or removing it if we only want this flow.
                // const response = await BackendService.processUserMessage(from, message.text?.body || '', name);
                // if (response && response.reply) {
                //     await WhatsAppService.sendMessage(from, response.reply);
                // }

            } catch (error) {
                console.error('Error processing job:', error);
                throw error;
            }
        }
    }
};
