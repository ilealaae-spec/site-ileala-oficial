// Test login functionality
import { sdk } from './server/_core/sdk';
import * as db from './server/db';

async function testLogin() {
  try {
    console.log('🔍 Testing login functionality...\n');
    
    // Step 1: Test database connection
    console.log('1️⃣ Testing database upsert...');
    const openId = 'emergency-admin-001';
    await db.upsertUser({
      openId,
      email: 'ceo@ileala.ae',
      name: 'Emergency Admin',
      role: 'admin',
      loginMethod: 'emergency',
      lastSignedIn: new Date(),
    });
    console.log('✅ Database upsert successful!\n');
    
    // Step 2: Test JWT token creation
    console.log('2️⃣ Testing JWT token creation...');
    const token = await sdk.createSessionToken(openId, {
      name: 'Emergency Admin',
    });
    console.log('✅ JWT token created successfully!');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...\n');
    
    // Step 3: Test token verification
    console.log('3️⃣ Testing token verification...');
    const session = await sdk.verifySession(token);
    console.log('✅ Token verified successfully!');
    console.log('Session data:', session);
    
    console.log('\n🎉 All tests passed! Login should work now.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testLogin();
