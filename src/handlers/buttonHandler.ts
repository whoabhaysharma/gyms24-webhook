import { BackendService } from '../services/backend';
import * as WhatsAppService from '../services/whatsapp';
import * as Templates from '../services/templates';
import { logWithContext } from '../utils/logger';

export const handleButtonClick = async (from: string, buttonId: string, name: string, originalFrom: string) => {
    logWithContext('ButtonHandler', `Handling button click: ${buttonId}`, { from, name });

    switch (buttonId) {
        case 'book_membership':
            await handleBookMembership(from, originalFrom);
            break;
        case 'my_memberships':
            await handleMyMemberships(from, name, originalFrom);
            break;
        default:
            logWithContext('ButtonHandler', `Unknown button ID: ${buttonId}`, {}, 'warn');
            break;
    }
};

const handleBookMembership = async (from: string, originalFrom: string) => {
    const magicLink = await BackendService.getMagicLink(from);
    if (magicLink) {
        const messageContent = Templates.createCTAUrlContent(
            `Great choice! 🎉\n\nClick the button below to securely book your membership.`,
            'Book Membership',
            magicLink,
            'Start Your Fitness Journey',
            'Gyms24'
        );
        await WhatsAppService.sendMessage(originalFrom, messageContent);

        // Simulate successful booking after a short delay (for testing)
        // This should be removed or moved to a separate testing flow in production
        await new Promise(resolve => setTimeout(resolve, 5000));
        const mockAccessCode = Math.floor(100000 + Math.random() * 900000);
        await WhatsAppService.sendMessage(
            originalFrom,
            `Payment Successful! 🎉\n\nYour membership is now active.\n\n🔑 *Access Code: ${mockAccessCode}*\n\nYou can also view this code anytime by clicking "My Memberships".`
        );
    } else {
        await WhatsAppService.sendMessage(originalFrom, 'Sorry, we could not generate a booking link at this time. Please try again later.');
    }
};

const handleMyMemberships = async (from: string, name: string, originalFrom: string) => {
    const user = await BackendService.getUserByMobile(from);
    if (!user) {
        await WhatsAppService.sendMessage(originalFrom, 'We could not find an account associated with this number. Please book a membership first!');
    } else {
        const subscriptions = await BackendService.getSubscriptions(user.id);
        if (subscriptions.length > 0) {
            let response = `*Active Memberships for ${name}:*\n\n`;
            subscriptions.forEach((sub) => {
                response += `🏋️ *${sub.gym.name}* - ${sub.plan.name}\n📅 Ends: ${new Date(sub.endDate).toLocaleDateString()}\n🔑 Access Code: *${sub.accessCode}*\n\n`;
            });
            await WhatsAppService.sendMessage(originalFrom, response);
        } else {
            await WhatsAppService.sendMessage(originalFrom, 'You have no active memberships.');
        }
    }
};
