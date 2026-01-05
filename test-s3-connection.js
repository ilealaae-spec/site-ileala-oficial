// Script para testar conexão S3
// Execute: node test-s3-connection.js

const { S3Client, ListBucketsCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
const bucketName = process.env.AWS_S3_BUCKET || 'ileala-uploads';

console.log('=== Teste de Conexão S3 ===\n');
console.log('Configuração:');
console.log('  Region:', region);
console.log('  Bucket:', bucketName);
console.log('  Access Key ID:', accessKeyId ? accessKeyId.substring(0, 8) + '...' : 'NOT SET');
console.log('  Secret Key:', secretAccessKey ? 'SET (' + secretAccessKey.length + ' chars)' : 'NOT SET');
console.log('');

if (!accessKeyId || !secretAccessKey) {
  console.error('❌ ERRO: Credenciais AWS não configuradas!');
  console.error('Configure as variáveis de ambiente:');
  console.error('  AWS_ACCESS_KEY_ID');
  console.error('  AWS_SECRET_ACCESS_KEY');
  console.error('  AWS_REGION');
  console.error('  AWS_S3_BUCKET');
  process.exit(1);
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function testConnection() {
  try {
    // Test 1: List buckets (verifica se credenciais funcionam)
    console.log('Teste 1: Listando buckets...');
    const listCommand = new ListBucketsCommand({});
    const listResponse = await s3Client.send(listCommand);
    console.log('✅ Credenciais válidas!');
    console.log('Buckets encontrados:', listResponse.Buckets?.map(b => b.Name).join(', ') || 'Nenhum');
    console.log('');

    // Test 2: Verificar se o bucket existe
    console.log('Teste 2: Verificando se o bucket existe...');
    const bucketExists = listResponse.Buckets?.some(b => b.Name === bucketName);
    if (bucketExists) {
      console.log(`✅ Bucket '${bucketName}' encontrado!`);
    } else {
      console.error(`❌ Bucket '${bucketName}' NÃO encontrado!`);
      console.error('Buckets disponíveis:', listResponse.Buckets?.map(b => b.Name).join(', ') || 'Nenhum');
      return;
    }
    console.log('');

    // Test 3: Tentar fazer upload de teste
    console.log('Teste 3: Tentando fazer upload de teste...');
    const testKey = `test/${Date.now()}-test.txt`;
    const testContent = Buffer.from('Test upload from Railway');
    
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });
    
    await s3Client.send(putCommand);
    console.log('✅ Upload de teste bem-sucedido!');
    console.log(`   Key: ${testKey}`);
    console.log(`   URL: https://${bucketName}.s3.amazonaws.com/${testKey}`);
    console.log('');

    console.log('✅✅✅ TODOS OS TESTES PASSARAM! ✅✅✅');
    console.log('O S3 está configurado corretamente.');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('Detalhes:', {
      name: error.name,
      code: error.Code || error.code,
      requestId: error.requestId || error.$metadata?.requestId,
    });
    
    if (error.message.includes('bucket is not valid')) {
      console.error('\n💡 Possíveis causas:');
      console.error('  1. Bucket não existe na região', region);
      console.error('  2. Nome do bucket está incorreto:', bucketName);
      console.error('  3. Credenciais não têm acesso ao bucket');
    }
    
    process.exit(1);
  }
}

testConnection();

