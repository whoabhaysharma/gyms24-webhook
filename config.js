require('dotenv').config();

const config = {
    VERIFY_TOKEN: process.env.VERIFY_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_TOKEN: process.env.API_KEY,
    WHATSAPP_API_URL: `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    PORT: process.env.PORT || 3000,

    GYMS: [
        { id: "fitbull_gym", name: "Fitbull Gym" },
        { id: "fitness_crave_gym", name: "Fitness Crave Gym" }
    ],

    PLANS: [
        { id: "plan_1month", name: "1 Month Plan", price: 1 },
        { id: "plan_3month", name: "3 Month Plan", price: 1 },
        { id: "plan_12month", name: "12 Month Plan", price: 1 }
    ]
};

module.exports = config;
