import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { TestDiscovery } from './testDiscovery';
import { TestRunner } from './testRunner';

export interface ServerConfig {
  port?: number;
  baseDir?: string;
  testPattern?: string;
  excludePatterns?: string[];
  wdioConfigPath?: string;
}

export function startServer(config: ServerConfig = {}) {
  // Initialize Express app
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);
  const port = config.port || 3000;
  
  // Set up view engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());
  
  // Initialize test discovery and runner
  const testDiscovery = new TestDiscovery(
    config.baseDir,
    config.testPattern,
    config.excludePatterns
  );
  
  const testRunner = new TestRunner(io, config.wdioConfigPath);
  
  // Routes
  app.get('/', async (req, res) => {
    const testFiles = await testDiscovery.findTestFiles();
    res.render('index', { testFiles });
  });
  
  // API endpoints
  app.get('/api/tests', async (req, res) => {
    const testFiles = await testDiscovery.findTestFiles();
    res.json(testFiles);
  });
  
  app.post('/api/run-test', (req, res) => {
    const { testFile, spec, headless = true } = req.body;
    
    if (!testFile) {
      return res.status(400).json({ error: 'Test file is required' });
    }
    
    testRunner.runTest(testFile, spec, headless);
    res.json({ message: 'Test execution started' });
  });
  
  // Socket.io connection
  io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('run-test', (data) => {
      const { testFile, spec, headless = true } = data;
      testRunner.runTest(testFile, spec, headless);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
  
  // Start server
  server.listen(port, () => {
    console.log(`WebdriverIO Test Runner UI is running at http://localhost:${port}`);
  });
  
  return server;
}

// If this file is executed directly, start the server
if (require.main === module) {
  startServer();
} 