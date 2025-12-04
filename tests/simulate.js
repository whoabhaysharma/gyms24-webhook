const webhookController = require('../src/controllers/webhook.controller');
const whatsappService = require('../src/services/whatsapp.service');
const backendService = require('../src/services/backend.service');

// --- MOCKS ---

// Mock Response
const mockRes = {
    status: (code) => ({
        send: (msg) => console.log(`[RES] Status: ${code}, Body:`, msg),
        json: (data) => console.log(`[RES] Status: ${code}, JSON:`, data)
    })
};

// Mock Request Creator
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

// Mock WhatsApp Service sendMessage (to avoid actual API calls)
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

// --- SIMULATION ---

async function runSimulation() {
    const userPhone = "919876543210";

    console.log("Initializing simulation with REAL backend...");

    // 1. Fetch real gyms to use in simulation
    console.log("Fetching gyms from backend...");
    const gyms = await backendService.getGyms();
    if (gyms.length === 0) {
        console.error("❌ No gyms found in backend! Cannot proceed with gym selection simulation.");
        return;
    }
    const selectedGym = gyms[0];
    console.log(`✅ Found ${gyms.length} gyms. Using Gym: ${selectedGym.name} (ID: ${selectedGym.id})`);

    // 2. Fetch real plans for the selected gym
    console.log(`Fetching plans for Gym ID: ${selectedGym.id}...`);
    const plans = await backendService.getPlans(selectedGym.id);
    if (plans.length === 0) {
        console.error("❌ No plans found for this gym! Cannot proceed with plan selection simulation.");
        return;
    }
    const selectedPlan = plans[0];
    console.log(`✅ Found ${plans.length} plans. Using Plan: ${selectedPlan.name} (ID: ${selectedPlan.id})`);


    console.log("\n>>> SIMULATION 1: User says 'Hi'");
    await webhookController.handleIncomingMessage(createMockReq({
        from: userPhone,
        text: { body: "Hi" }
    }), mockRes);

    console.log("\n>>> SIMULATION 2: User clicks 'Buy Membership' (Button Reply)");
    await webhookController.handleIncomingMessage(createMockReq({
        from: userPhone,
        interactive: {
            button_reply: { id: "buy_membership" }
        }
    }), mockRes);

    console.log("\n>>> SIMULATION 3: User selects a Gym (List Reply)");
    // Using REAL Gym ID
    await webhookController.handleIncomingMessage(createMockReq({
        from: userPhone,
        interactive: {
            list_reply: { id: `gym_${selectedGym.id}`, title: selectedGym.name }
        }
    }), mockRes);

    console.log("\n>>> SIMULATION 4: User selects a Plan (List Reply)");
    // Using REAL Plan ID
    await webhookController.handleIncomingMessage(createMockReq({
        from: userPhone,
        interactive: {
            list_reply: { id: `plan_${selectedGym.id}_${selectedPlan.id}`, title: selectedPlan.name }
        }
    }), mockRes);

    console.log("\n>>> SIMULATION 5: User clicks 'Check Status' (Button Reply)");
    await webhookController.handleIncomingMessage(createMockReq({
        from: userPhone,
        interactive: {
            button_reply: { id: "check_status" }
        }
    }), mockRes);

    console.log("\n✅ Simulation complete!");
}

runSimulation().catch(console.error);
