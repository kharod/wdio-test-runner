import { Server } from 'socket.io';
import { Launcher } from '@wdio/cli';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export class TestRunner {
  private io: Server;
  private tempConfigDir: string;
  private wdioConfigPath?: string;

  constructor(io: Server, wdioConfigPath?: string) {
    this.io = io;
    this.tempConfigDir = path.join(os.tmpdir(), 'wdio-ui-runner');
    this.wdioConfigPath = wdioConfigPath;
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(this.tempConfigDir)) {
      fs.mkdirSync(this.tempConfigDir, { recursive: true });
    }
  }

  /**
   * Run a WebdriverIO test file or specific spec
   * @param testFile Path to the test file
   * @param spec Optional test specification to run
   * @param headless Whether to run tests in headless mode (default: true)
   */
  async runTest(testFile: string, spec?: string, headless: boolean = true): Promise<void> {
    try {
      // Emit start event
      this.io.emit('test:start', { testFile, spec, headless });

      // Create a temporary config file for this test run
      const configPath = await this.createTempConfig(testFile, spec, headless);
      
      // Initialize the WebdriverIO launcher
      const wdio = new Launcher(configPath);
      
      // Configure stdout/stderr capture
      const originalStdoutWrite = process.stdout.write.bind(process.stdout);
      const originalStderrWrite = process.stderr.write.bind(process.stderr);
      
      const io = this.io; // Store io instance in closure
      
      process.stdout.write = function(chunk: string | Uint8Array, encoding?: BufferEncoding | ((err?: Error) => void), callback?: (err?: Error) => void): boolean {
        // Send output to UI via Socket.io
        if (typeof chunk === 'string') {
          io.emit('test:log', { type: 'stdout', content: chunk });
        }
        return originalStdoutWrite.call(process.stdout, chunk, encoding as BufferEncoding, callback);
      };
      
      process.stderr.write = function(chunk: string | Uint8Array, encoding?: BufferEncoding | ((err?: Error) => void), callback?: (err?: Error) => void): boolean {
        // Send error output to UI via Socket.io
        if (typeof chunk === 'string') {
          io.emit('test:log', { type: 'stderr', content: chunk });
        }
        return originalStderrWrite.call(process.stderr, chunk, encoding as BufferEncoding, callback);
      };
      
      // Run the test
      const exitCode = await wdio.run();
      
      // Restore original stdout/stderr
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;
      
      // Emit completion event
      this.io.emit('test:complete', { 
        testFile, 
        spec, 
        headless,
        success: exitCode === 0,
        exitCode
      });
      
    } catch (error) {
      console.error('Error running test:', error);
      this.io.emit('test:error', { 
        testFile, 
        spec, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * Create a temporary WebdriverIO config for running a specific test
   * @param testFile Path to the test file
   * @param spec Optional test specification to run
   * @param headless Whether to run tests in headless mode
   */
  private async createTempConfig(testFile: string, spec?: string, headless: boolean = true): Promise<string> {
    // Find the project's wdio.conf.js file
    const projectRoot = process.cwd();
    let baseConfigPath = this.wdioConfigPath || '';
    
    if (!baseConfigPath) {
      // Look for common config file names in the consumer's project
      const configFiles = [
        'wdio.conf.js',
        'wdio.conf.ts',
        'wdio.config.js',
        'wdio.config.ts',
        'e2e/wdio.conf.js',
        'e2e/wdio.conf.ts',
        'test/wdio.conf.js',
        'test/wdio.conf.ts',
        'tests/wdio.conf.js',
        'tests/wdio.conf.ts',
        'integration/wdio.conf.js',
        'integration/wdio.conf.ts'
      ];
      
      for (const file of configFiles) {
        const configPath = path.join(projectRoot, file);
        if (fs.existsSync(configPath)) {
          baseConfigPath = configPath;
          break;
        }
      }
    }
    
    if (!baseConfigPath) {
      throw new Error('Could not find WebdriverIO configuration file in the consumer project. Please provide a path to your wdio config file when starting the test runner.');
    }
    
    // Create a temporary config file that extends the base config
    const tempConfigFilename = `wdio-${Date.now()}.conf.js`;
    const tempConfigPath = path.join(this.tempConfigDir, tempConfigFilename);
    
    // Use path.relative to create a relative path from the temp config to the base config
    let relativeBaseConfigPath = path.relative(this.tempConfigDir, baseConfigPath);
    
    // Convert to posix path format for require statement
    relativeBaseConfigPath = relativeBaseConfigPath.replace(/\\/g, '/');
    
    // If the path doesn't start with ./ or ../ add ./
    if (!relativeBaseConfigPath.startsWith('.')) {
      relativeBaseConfigPath = `./${relativeBaseConfigPath}`;
    }
    
    // Set up the chrome options based on headless mode
    const chromeOptions = headless ? 
      `args: ['--headless=new', '--disable-gpu', '--no-sandbox']` :
      `args: ['--disable-gpu', '--no-sandbox']`;
    
    // Generate a temporary config that extends the project's config
    const configContent = `
      const path = require('path');
      const baseConfig = require('${relativeBaseConfigPath}');
      
      exports.config = {
        ...baseConfig.config,
        specs: ['${testFile.replace(/\\/g, '/')}'],
        ${spec ? `mochaOpts: {
          ...baseConfig.config.mochaOpts,
          grep: '${spec.replace(/'/g, '\\\'')}'
        },` : ''}
        capabilities: [{
          ...(baseConfig.config.capabilities && baseConfig.config.capabilities[0] ? baseConfig.config.capabilities[0] : {}),
          browserName: 'chrome',
          'goog:chromeOptions': {
            ${chromeOptions}
          }
        }]
      };
    `;
    
    fs.writeFileSync(tempConfigPath, configContent);
    return tempConfigPath;
  }
} 