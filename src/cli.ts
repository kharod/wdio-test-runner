#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import { startServer } from './index';
import { TestDiscovery } from './testDiscovery';
import fs from 'fs';

const program = new Command();

program
  .name('wdio-test-runner-ui')
  .description('WebdriverIO UI Test Runner')
  .version('1.0.0');

program
  .command('start')
  .description('Start the WebdriverIO Test Runner UI')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('-t, --test-pattern <pattern>', 'Pattern to find test files', '**/*.{spec,test}.{js,ts}')
  .option('-d, --directory <directory>', 'Directory to search for tests', process.cwd())
  .option('-e, --exclude <pattern>', 'Pattern to exclude (can be used multiple times)', (val, prev) => {
    prev.push(val);
    return prev;
  }, ['**/node_modules/**'])
  .option('-c, --config <file>', 'Path to wdio config file')
  .option('-w, --wdio-path <path>', 'Path to WebdriverIO project relative to directory', 'integration/wdio')
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
    startServer(config);
  });

program.parse(process.argv); 