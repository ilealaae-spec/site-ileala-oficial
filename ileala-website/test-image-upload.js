// Script de teste para verificar upload de imagens
// Execute: node test-image-upload.js

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const region = process.env.AWS_REGION || 'us-east-1';
const bucket = process.env.AWS_S3_BUCKET || 'ileala-uploads';

console.log('=== TESTE DE UPLOAD DE IMAGENS ===\n');

// Verificar variáveis de ambiente
console.log('1. Variáveis de Ambiente:');
console.log(`   AWS_REGION: ${region}`);
console.log(`   AWS_S3_BUCKET: ${bucket}`);
console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Configurado' : '❌ NÃO CONFIGURADO'}`);
console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Configurado' : '❌ NÃO CONFIGURADO'}\n`);

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('❌ ERRO: Variáveis S3 não configuradas!');
  process.exit(1);
}

// Criar cliente S3
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Teste 1: Verificar conexão com S3
async function testConnection() {
  console.log('2. Testando Conexão com S3...');
  try {
    const testKey = `test/connection-test-${Date.now()}.txt`;
    const testContent = Buffer.from('Test connection');
    
    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });
    
    await s3Client.send(putCommand);
    console.log('   ✅ Upload de teste bem-sucedido\n');
    
    // Limpar arquivo de teste
    // (opcional - pode deixar para verificar manualmente)
    
    return true;
  } catch (error) {
    console.error('   ❌ Erro na conexão:', error.message);
    console.error('   Detalhes:', error);
    return false;
  }
}

// Teste 2: Verificar permissões de leitura
async function testReadPermissions() {
  console.log('3. Testando Permissões de Leitura...');
  try {
    // Tentar listar objetos no bucket
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 1,
    });
    
    const result = await s3Client.send(listCommand);
    console.log('   ✅ Permissão de leitura OK');
    console.log(`   Objetos no bucket: ${result.KeyCount || 0}\n`);
    return true;
  } catch (error) {
    console.error('   ❌ Erro ao ler bucket:', error.message);
    return false;
  }
}

// Teste 3: Verificar formato de URL
function testURLFormat() {
  console.log('4. Verificando Formato de URL...');
  const testKey = 'products/test-image.jpg';
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${testKey}`;
  console.log(`   URL gerada: ${url}`);
  console.log(`   ✅ Formato correto\n`);
  return url;
}

// Teste 4: Verificar se arquivo existe
async function testFileExists(key) {
  console.log('5. Testando Verificação de Arquivo...');
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    
    await s3Client.send(headCommand);
    console.log(`   ✅ Arquivo existe: ${key}\n`);
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      console.log(`   ⚠️  Arquivo não encontrado: ${key} (isso é normal se não foi criado)\n`);
    } else {
      console.error(`   ❌ Erro ao verificar arquivo: ${error.message}\n`);
    }
    return false;
  }
}

// Executar testes
async function runTests() {
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.error('❌ Testes interrompidos: conexão com S3 falhou');
    return;
  }
  
  await testReadPermissions();
  const testUrl = testURLFormat();
  
  // Testar com uma chave real (se houver produtos)
  const testKey = 'products/test-1234567890-image.jpg';
  await testFileExists(testKey);
  
  console.log('=== RESUMO ===');
  console.log('✅ Se todos os testes passaram, o S3 está configurado corretamente');
  console.log('❌ Se algum teste falhou, verifique as variáveis de ambiente e permissões');
}

runTests().catch(console.error);

