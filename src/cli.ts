#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import { startTestRunnerUI } from './index';
import fs from 'fs';
import { TestFile } from './testDiscovery';

const program = new Command();

// Get version from package.json
let version = '1.0.0';
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  version = packageJson.version || '1.0.0';
} catch (error) {
  // Fallback to default version if package.json can't be read
}

program
  .name('wdio-test-runner-ui')
  .description('WebdriverIO UI Test Runner for existing projects')
  .version(version);

program
  .command('start')
  .description('Start the WebdriverIO Test Runner UI')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('-t, --test-pattern <pattern>', 'Pattern to find test files', '**/*.{spec,test}.{js,ts}')
  .option('-d, --directory <directory>', 'Directory to search for tests (defaults to current directory)', process.cwd())
  .option('-e, --exclude <pattern>', 'Pattern to exclude (can be used multiple times)', (val, prev) => {
    prev.push(val);
    return prev;
  }, ['**/node_modules/**'])
  .option('-c, --config <file>', 'Path to wdio config file')
  .option('-w, --wdio-path <path>', 'Path to WebdriverIO test directory relative to base directory')
  .action((options) => {
    // Validate directory
    if (!fs.existsSync(options.directory)) {
      console.error(`Directory not found: ${options.directory}`);
      process.exit(1);
    }

    // Validate config file if provided
    if (options.config && !fs.existsSync(options.config)) {
      console.error(`Config file not found: ${options.config}`);
      process.exit(1);
    }

    const config = {
      port: parseInt(options.port, 10),
      testPattern: options.testPattern,
      baseDir: path.resolve(options.directory),
      excludePatterns: options.exclude,
      wdioConfigPath: options.config ? path.resolve(options.config) : undefined,
      wdioPath: options.wdioPath
    };

    console.log('Starting WebdriverIO Test Runner UI with config:', config);
    startTestRunnerUI(config);
  });

// Add a command to only list test files without starting the UI
program
  .command('list-tests')
  .description('List available test files without starting the UI')
  .option('-t, --test-pattern <pattern>', 'Pattern to find test files', '**/*.{spec,test}.{js,ts}')
  .option('-d, --directory <directory>', 'Directory to search for tests', process.cwd())
  .option('-e, --exclude <pattern>', 'Pattern to exclude (can be used multiple times)', (val, prev) => {
    prev.push(val);
    return prev;
  }, ['**/node_modules/**'])
  .option('-w, --wdio-path <path>', 'Path to WebdriverIO test directory relative to base directory')
  .action(async (options) => {
    const { TestDiscovery } = require('./testDiscovery');
    
    const testDiscovery = new TestDiscovery(
      path.resolve(options.directory),
      options.testPattern,
      options.exclude,
      options.wdioPath
    );
    
    try {
      const testFiles = await testDiscovery.findTestFiles();
      console.log('Found', testFiles.length, 'test files:');
      testFiles.forEach((file: TestFile) => {
        console.log(`- ${file.relativePath} (${file.specs.length} specs)`);
      });
    } catch (error) {
      console.error('Error listing test files:', error);
      process.exit(1);
    }
  });

program.parse(process.argv); 