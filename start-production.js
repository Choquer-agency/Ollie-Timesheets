import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 8080;
const EMAIL_PORT = process.env.EMAIL_PORT || 3001;

console.log('🚀 Starting Ollie Timesheets Production Server...');

// Start email server
const emailServer = spawn('node', ['server/index.js'], {
  env: { ...process.env, PORT: EMAIL_PORT },
  stdio: 'inherit',
  cwd: __dirname
});

emailServer.on('error', (error) => {
  console.error('❌ Email server error:', error);
});

// Start frontend server (serves the built Vite app)
const frontendServer = spawn('npx', ['serve', '-s', 'dist', '-l', PORT], {
  stdio: 'inherit',
  cwd: __dirname,
  shell: true
});

frontendServer.on('error', (error) => {
  console.error('❌ Frontend server error:', error);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('Shutting down servers...');
  emailServer.kill();
  frontendServer.kill();
  process.exit(0);
});

console.log(`📧 Email server starting on port ${EMAIL_PORT}`);
console.log(`🌐 Frontend server starting on port ${PORT}`);

