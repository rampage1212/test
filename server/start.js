import dotenv from 'dotenv';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = resolve(__dirname, 'server.ts');

// Start the server with tsx
const server = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
