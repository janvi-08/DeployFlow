import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_PORT = 5000;

async function isPortInUse(port) {
  return await new Promise((resolve) => {
    const testSocket = net.createServer();

    testSocket.once('error', (err) => {
      resolve(err && err.code === 'EADDRINUSE');
    });

    testSocket.once('listening', () => {
      testSocket.close(() => resolve(false));
    });

    testSocket.listen(port, '127.0.0.1');
  });
}

console.log('\x1b[36m===================================================\x1b[0m');
console.log('\x1b[32m   🚀 Launching DeployFlow Full-Stack System       \x1b[0m');
console.log('\x1b[36m===================================================\x1b[0m');

const portInUse = await isPortInUse(BACKEND_PORT);

if (portInUse) {
  console.log(`\x1b[33mPort ${BACKEND_PORT} is already in use.\x1b[0m`);
  console.log('A previous DeployFlow backend is likely still running.');
  console.log('Either leave it running, or stop the stale Node process and re-run this launcher.');
  console.log('Starting Frontend Client (Port 5173)...');
} else {
  console.log(`Starting Backend Server (Port ${BACKEND_PORT})...`);
}

console.log('Starting Frontend Client (Port 5173)...');

const serverProcess = !portInUse
  ? spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'server'),
      stdio: 'inherit',
      shell: true,
    })
  : null;

const clientProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

serverProcess?.on('error', (err) => {
  console.error('Server process error:', err);
});

clientProcess.on('error', (err) => {
  console.error('Client process error:', err);
});

process.on('SIGINT', () => {
  try {
    serverProcess?.kill();
    clientProcess.kill();
  } catch (e) {}
  process.exit(0);
});
