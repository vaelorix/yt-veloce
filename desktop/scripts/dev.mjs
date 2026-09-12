import { spawn } from 'child_process';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import electron from 'electron';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function startDev() {
  // 1. Build main and preload
  console.log('[Dev] Compiling main & preload processes...');
  await new Promise((resolve, reject) => {
    const tsc = spawn('npx', ['tsc', '-p', 'tsconfig.node.json'], {
      cwd: rootDir,
      shell: true,
      stdio: 'inherit'
    });
    tsc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`TypeScript compilation failed with code ${code}`));
    });
  });

  // 2. Start Vite server
  console.log('[Dev] Starting Vite development server...');
  const server = await createServer({
    configFile: path.resolve(rootDir, 'vite.config.ts')
  });
  await server.listen();

  const info = server.resolvedUrls;
  const devUrl = info?.local?.[0] || `http://localhost:${server.config.server.port || 5173}`;
  console.log(`[Dev] Vite running at ${devUrl}`);

  // 3. Launch Electron
  console.log('[Dev] Launching Electron...');
  const electronProcess = spawn(electron, [path.resolve(rootDir, 'dist/main/index.js')], {
    cwd: rootDir,
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: devUrl,
      NODE_ENV: 'development'
    },
    stdio: 'inherit'
  });

  electronProcess.on('close', async () => {
    console.log('[Dev] Electron process closed. Shutting down dev server...');
    await server.close();
    process.exit(0);
  });
}

startDev().catch((err) => {
  console.error('[Dev Error]', err);
  process.exit(1);
});
