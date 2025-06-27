import { UnipileClient } from 'unipile-node-sdk';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// CONFIGURATION - All from environment variables
const UNIPILE_DSN = process.env.UNIPILE_DSN ;
const UNIPILE_API_KEY = process.env.UNIPILE_API_KEY;
const LINKEDIN_ACCOUNT_ID = process.env.LINKEDIN_ACCOUNT_ID;

// -- Uncomment & fill if you need to (re)connect LinkedIn
// const LINKEDIN_USERNAME = 'your LinkedIn username';
// const LINKEDIN_PASSWORD = 'your LinkedIn password';

const MESSAGE_TEXT = `Hi! Thanks for connecting - getting a bunch of requests right now so it's a bit hard to keep track of where they're coming from. If you connected to get access to the consulting prep interviews, here's the link as promised:

https://www.safirahiring.com/auth?token=6o6npz2!18Bl&mode=signup

This link is valid until July 1st and will give you a three day free trial before charging you. If the connection was regarding anything else, please feel free to respond and I'll get back as soon as I can :)
`;


const inputFile = process.argv[2] || 'cleaned_profiles.csv';

// Add logging for configuration
console.log('=== CONFIGURATION ===');
console.log('UNIPILE_DSN:', UNIPILE_DSN);
console.log('UNIPILE_API_KEY:', UNIPILE_API_KEY ? '***SET***' : '***NOT SET***');
console.log('LINKEDIN_ACCOUNT_ID:', LINKEDIN_ACCOUNT_ID);
console.log('Input file:', inputFile);
console.log('====================');

if (!UNIPILE_API_KEY) {
  console.error('ERROR: UNIPILE_API_KEY environment variable is not set!');
  console.error('Please set it with: export UNIPILE_API_KEY="your-api-key"');
  process.exit(1);
}

const client = new UnipileClient(UNIPILE_DSN, UNIPILE_API_KEY);

// Test client initialization
console.log('Client initialized:', !!client);
console.log('Client.user available:', !!client.user);
console.log('Client.messaging available:', !!client.messaging);

async function getProviderIdFromPublicId(publicId) {
  console.log(`\n--- Getting provider_id for: ${publicId} ---`);
  
  try {
    console.log('Making API call to client.users.getProfile...');
    console.log('Parameters:', {
      account_id: LINKEDIN_ACCOUNT_ID,
      identifier: publicId
    });
    
    const response = await client.users.getProfile({
      account_id: LINKEDIN_ACCOUNT_ID,
      identifier: publicId,
    });
    
    console.log('API response received:', !!response);
    console.log('Response object keys:', response ? Object.keys(response) : 'null');
    console.log('Full response:', JSON.stringify(response, null, 2));
    
    // The response should contain the provider_id or user information
    // Let's check what's available in the response
    return response?.provider_id || response?.id || null;
  } catch (e) {
    console.error(`Failed to get provider_id for ${publicId}:`, e.message);
    console.error('Full error:', e);
    console.error('Error stack:', e.stack);
    return null;
  }
}

async function sendLinkedInMessage(providerId, message) {
  console.log(`\n--- Sending message to provider_id: ${providerId} ---`);
  
  try {
    console.log('Making API call to client.messaging.startNewChat...');
    console.log('Parameters:', {
      account_id: LINKEDIN_ACCOUNT_ID,
      text: message,
      attendees_ids: [providerId]
    });
    
    await client.messaging.startNewChat({
      account_id: LINKEDIN_ACCOUNT_ID,
      text: message,
      attendees_ids: [providerId],
    });
    console.log(`✅ Message sent successfully to ${providerId}`);
  } catch (e) {
    console.error(`❌ Failed to send message to ${providerId}:`, e.message);
    console.error('Full error:', e);
    console.error('Error stack:', e.stack);
  }
}

async function main() {
  console.log('\n=== STARTING MAIN PROCESS ===');
  
  // OPTIONAL: Connect LinkedIn account if not already done in Unipile
  // await client.account.connectLinkedin({ username: LINKEDIN_USERNAME, password: LINKEDIN_PASSWORD });

  const publicIds = [];
  
  console.log(`Reading from file: ${inputFile}`);
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    process.exit(1);
  }
  
  fs.createReadStream(inputFile)
    .pipe(csv({ headers: false }))
    .on('data', (row) => {
      const url = row[0] || Object.values(row)[0];
      console.log('Processing row:', url);
      if (url && url.includes('linkedin.com/in/')) {
        const publicId = url.split('linkedin.com/in/')[1].replace(/\/$/, '').split('/')[0];
        console.log(`Extracted public ID: ${publicId} from URL: ${url}`);
        publicIds.push(publicId);
      }
    })
    .on('end', async () => {
      console.log(`\n=== PROCESSING ${publicIds.length} PROFILES ===`);
      console.log('Public IDs to process:', publicIds);
      
      for (let i = 0; i < publicIds.length; i++) {
        const publicId = publicIds[i];
        console.log(`\n[${i + 1}/${publicIds.length}] Processing: ${publicId}`);
        
        const providerId = await getProviderIdFromPublicId(publicId);
        if (providerId) {
          await sendLinkedInMessage(providerId, MESSAGE_TEXT);
          const delay = Math.floor(Math.random() * (8000 - 2000 + 1)) + 3000; // Random delay between 3-9 seconds
          console.log(`Waiting ${delay/1000} seconds before next request...`);
          await new Promise(r => setTimeout(r, delay)); // throttle to be safe
        } else {
          console.log(`⚠️ Skipping ${publicId} - no provider_id found`);
        }
      }
      console.log('\n=== DONE! ===');
    });
}

main().catch(error => {
  console.error('Fatal error in main:', error);
  process.exit(1);
});
