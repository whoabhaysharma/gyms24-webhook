const webhookController = require('../src/controllers/webhook.controller');

// Mock Request and Response
const mockRes = {
    status: (code) => ({
        send: (msg) => console.log(`[RES] Status: ${code}, Body:`, msg),
        json: (data) => console.log(`[RES] Status: ${code}, JSON:`, data)
    })
};

const createMockReq = (messageBody) => ({
    body: {
        entry: [{
            changes: [{
                value: {
                    messages: [messageBody]
                }
            }]
        }]
    }
});

// Override sendMessage in whatsappService for simulation
const whatsappService = require('../src/services/whatsapp.service');
const originalSendMessage = whatsappService.sendMessage;

whatsappService.sendMessage = async (payload) => {
    console.log("---------------------------------------------------");
    console.log("[WHATSAPP SEND] To:", payload.to);
    if (payload.text) console.log("Text:", payload.text.body);
    if (payload.interactive) {
        console.log("Interactive Type:", payload.interactive.type);
        if (payload.interactive.body) console.log("Body:", payload.interactive.body.text);
        if (payload.interactive.action) {
            console.log("Action:", JSON.stringify(payload.interactive.action, null, 2));
        }
    }
    console.log("---------------------------------------------------");
};

async function runSimulation() {
    const userPhone = "919876543210";

    console.log("\n>>> SIMULATION 1: User says 'Hi'");
    await webhookController.handleIncomingMessage(createMockReq({
        from: userPhone,
        text: { body: "Hi" }
    }), mockRes);

    console.log("\n>>> SIMULATION 2: User clicks 'Book a Gym'");
    await webhookController.handleIncomingMessage(createMockReq({
        from: userPhone,
        interactive: {
            button_reply: { id: "start_booking" }
        }
    }), mockRes);

    console.log("\n>>> SIMULATION 3: User clicks 'Check Status'");
    await webhookController.handleIncomingMessage(createMockReq({
        from: userPhone,
        interactive: {
            button_reply: { id: "check_status" }
        }
    }), mockRes);

    console.log("\n✅ Simulation complete!");
    console.log("\nNote: Backend connection errors are expected if backend is not running.");
}

runSimulation().catch(console.error);
