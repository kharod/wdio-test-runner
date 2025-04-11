/**
 * Example of integrating the WebdriverIO Test Runner UI into an existing project
 * 
 * This script shows how to start the UI test runner programmatically
 * from within your existing project's code.
 */

// Import the startTestRunnerUI function
const { startTestRunnerUI } = require('../dist/index');

// Start the test runner with options that point to your existing WebdriverIO setup
const server = startTestRunnerUI({
  // Port to run the server on
  port: 3030,
  
  // Base directory for your project (defaults to current working directory)
  baseDir: process.cwd(),
  
  // Pattern to find test files (adjust based on your project's conventions)
  testPattern: '**/*.{spec,test,e2e}.{js,ts}',
  
  // Paths to exclude (e.g., node_modules)
  excludePatterns: ['**/node_modules/**'],
  
  // Optional: Path to your WebdriverIO config file
  // If not provided, the runner will search for common config files
  wdioConfigPath: './wdio.conf.js',
  
  // Optional: Relative path to the WebdriverIO test directory
  // If not provided, the runner will try to auto-detect it
  wdioPath: 'tests'
});

console.log('Test Runner UI is now available at http://localhost:3030');

// You can also stop the server programmatically when needed
process.on('SIGINT', () => {
  console.log('Shutting down the Test Runner UI...');
  server.close(() => {
    console.log('Test Runner UI has been stopped');
    process.exit(0);
  });
}); 