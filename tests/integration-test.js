const backendService = require('../src/services/backend.service');
const config = require('../src/config');

// Mock config for test if env vars are missing
if (!config.backend.apiKey) {
    console.log('Using fallback test key');
    // This key must match one in your DB. 
    // Ideally, we should fetch it or pass it via ENV for this test.
    // For now, I'll rely on the user setting it or the previous script output.
    config.backend.apiKey = 'webhook-integration-test-key'; // Persistent key
    backendService.apiKey = config.backend.apiKey;
}

// Override URL for testing if needed
// backendService.baseUrl = 'http://localhost:3000/api'; 
// Note: The service uses config.backend.url which defaults to .../api/whatsapp
// But the methods call /gyms, /plans etc. 
// If backend.service.js appends /gyms to .../api/whatsapp, that's wrong.
// Let's check backend.service.js again.
// It does: axios.get(`${this.baseUrl}/gyms`
// So baseUrl should be .../api

backendService.baseUrl = 'http://localhost:3000/api';

async function testIntegration() {
    console.log('--- Testing Webhook -> Backend Integration ---');
    console.log('Target URL:', backendService.baseUrl);
    console.log('Using Key:', backendService.apiKey);

    try {
        console.log('\n1. Fetching Gyms...');
        const gyms = await backendService.getGyms();
        console.log('Gyms found:', gyms.length);
        if (gyms.length > 0) {
            console.log('First Gym:', gyms[0].name);
        }

        console.log('\nSUCCESS: Webhook service can talk to Backend!');
    } catch (error) {
        console.error('FAILED:', error.message);
    }
}

testIntegration();
