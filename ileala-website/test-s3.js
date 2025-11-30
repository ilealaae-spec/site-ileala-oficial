// Test S3 connection
import { S3Client, PutObjectCommand, ListBucketsCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || 'us-east-1';
const bucket = process.env.AWS_S3_BUCKET || 'ileala-uploads';

console.log('=== S3 Connection Test ===');
console.log('Region:', region);
console.log('Bucket:', bucket);
console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? `${process.env.AWS_ACCESS_KEY_ID.substring(0, 8)}...` : 'NOT SET');
console.log('Secret Access Key:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET (hidden)' : 'NOT SET');
console.log('');

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

async function testS3() {
  try {
    // Test 1: List buckets
    console.log('Test 1: Listing buckets...');
    const listCommand = new ListBucketsCommand({});
    const listResult = await s3Client.send(listCommand);
    console.log('✓ Successfully listed buckets:');
    listResult.Buckets?.forEach(b => {
      console.log(`  - ${b.Name}`);
    });
    console.log('');

    // Test 2: Check if our bucket exists
    console.log(`Test 2: Checking if bucket "${bucket}" exists...`);
    const headCommand = new HeadBucketCommand({ Bucket: bucket });
    await s3Client.send(headCommand);
    console.log(`✓ Bucket "${bucket}" exists and is accessible`);
    console.log('');

    // Test 3: Upload a test file
    console.log('Test 3: Uploading test file...');
    const testKey = `test/${Date.now()}-test.txt`;
    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: testKey,
      Body: Buffer.from('Test upload from Railway'),
      ContentType: 'text/plain',
    });
    await s3Client.send(putCommand);
    console.log(`✓ Successfully uploaded test file: ${testKey}`);
    console.log(`  URL: https://${bucket}.s3.${region}.amazonaws.com/${testKey}`);
    console.log('');

    console.log('=== All tests passed! ===');
  } catch (error) {
    console.error('✗ Test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.$metadata?.httpStatusCode);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testS3();
