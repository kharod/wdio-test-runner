#!/bin/bash
# Example script to add WebdriverIO Test Runner UI to an existing project

# Install the package
npm install --save-dev wdio-test-runner-ui

# Add a script to package.json
if grep -q "\"test:ui\":" package.json; then
  echo "test:ui script already exists in package.json"
else
  # Use sed to add the script (this is a simple approach, might need adjustments)
  sed -i 's/"scripts": {/"scripts": {\n    "test:ui": "wdio-test-runner-ui start",/g' package.json
  echo "Added test:ui script to package.json"
fi

# Create a basic configuration file for easy customization
cat > wdio-ui.config.js << EOL
/**
 * Configuration for WebdriverIO Test Runner UI
 * 
 * Import this file to customize the test runner.
 * Example usage:
 *   const { startTestRunnerUI } = require('wdio-test-runner-ui');
 *   const config = require('./wdio-ui.config.js');
 *   startTestRunnerUI(config);
 */

module.exports = {
  port: 3000,
  testPattern: '**/*.{spec,test,e2e}.{js,ts}',
  excludePatterns: ['**/node_modules/**', '**/fixtures/**'],
  // Uncomment and modify these lines as needed for your project
  // wdioConfigPath: './path/to/your/wdio.conf.js',
  // wdioPath: 'tests'
};
EOL

echo "Created wdio-ui.config.js with default settings"

# Print usage instructions
echo "
WebdriverIO Test Runner UI has been installed!

You can now run the UI with:
  npm run test:ui
  
Or with custom options:
  npx wdio-test-runner-ui start --port 8080
  
See wdio-ui.config.js for configuration options.
" 