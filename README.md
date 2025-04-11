# WebdriverIO Test Runner UI

A web-based UI for running WebdriverIO tests in existing projects.

## Features

- Web-based UI for running WebdriverIO tests
- Real-time test output
- Support for running specific tests or test suites
- Headless mode support
- Works with any existing WebdriverIO project
- Always uses your project's WebdriverIO configuration
- Support for both `.spec.ts` and `.test.ts` files
- Auto-detection of common test directories
- Compatible with various WebdriverIO project structures

## Installation

Add to your existing WebdriverIO project:

```bash
npm install --save-dev wdio-test-runner-ui
```

## Usage

### Command Line

```bash
# Using local installation in your project
npx wdio-test-runner-ui start
```

### Options

```
Usage: wdio-test-runner-ui start [options]

Start the WebdriverIO Test Runner UI

Options:
  -p, --port <port>             Port to run the server on (default: "3000")
  -t, --test-pattern <pattern>  Pattern to find test files (default: "**/*.{spec,test}.{js,ts}")
  -d, --directory <directory>   Directory to search for tests (defaults to current directory)
  -e, --exclude <pattern>       Pattern to exclude (can be used multiple times) (default: ["**/node_modules/**"])
  -c, --config <file>           Path to wdio config file (will auto-detect if not specified)
  -w, --wdio-path <path>        Path to WebdriverIO test directory relative to base directory
  -h, --help                    display help for command
```

You can also use the `list-tests` command to see which test files would be discovered:

```bash
npx wdio-test-runner-ui list-tests
```

### Examples

```bash
# Start with default settings
npx wdio-test-runner-ui start

# Specify a different port
npx wdio-test-runner-ui start --port 8080

# Specify a different test pattern
npx wdio-test-runner-ui start --test-pattern "**/*.e2e.js"

# Specify a different directory
npx wdio-test-runner-ui start --directory ./tests

# Specify a different WebdriverIO test path
npx wdio-test-runner-ui start --wdio-path ./e2e/tests

# Exclude multiple patterns
npx wdio-test-runner-ui start --exclude "**/node_modules/**" --exclude "**/fixtures/**"

# Specify a custom WebdriverIO config file
npx wdio-test-runner-ui start --config ./wdio.custom.conf.js
```

### Adding to your project scripts

Add a script to your package.json for easy access:

```json
{
  "scripts": {
    "test:ui": "wdio-test-runner-ui start"
  }
}
```

Then run with:

```bash
npm run test:ui
```

## Integration with Existing Project

This package is designed to integrate with existing WebdriverIO projects. It does the following:

1. Detects your existing WebdriverIO configuration
2. Finds your test files using common patterns
3. Provides a UI to select and run tests
4. Uses your project's WebdriverIO configuration for test execution

### Supported Project Structures

The test runner will automatically detect these common structures:

```
project-root/
├── wdio.conf.js
└── tests/
    └── example.spec.ts
```

```
project-root/
├── test/
│   ├── wdio.conf.js
│   └── specs/
│       └── example.spec.ts
```

```
project-root/
├── e2e/
│   ├── wdio.conf.js
│   └── tests/
│       └── example.test.ts
```

If your project uses a different structure, you can specify the path to your WebdriverIO configuration and test files using the command-line options.

## Programmatic Usage

You can also use this package programmatically in your own code:

```javascript
const { startTestRunnerUI } = require('wdio-test-runner-ui');

// Start with default options
startTestRunnerUI();

// Or with custom options
startTestRunnerUI({
  port: 8080,
  baseDir: './tests',
  testPattern: '**/*.spec.js',
  excludePatterns: ['**/node_modules/**', '**/fixtures/**'],
  wdioConfigPath: './wdio.custom.conf.js'
});
```

## Configuration

This package does not use its own WebdriverIO configuration. It will search for and use your project's WebdriverIO configuration file. By default, it looks for:

- `wdio.conf.js`
- `wdio.conf.ts`
- `wdio.config.js`
- `wdio.config.ts`
- `e2e/wdio.conf.js`
- `e2e/wdio.conf.ts`
- `test/wdio.conf.js`
- `test/wdio.conf.ts`
- `tests/wdio.conf.js`
- `tests/wdio.conf.ts`
- `integration/wdio.conf.js`
- `integration/wdio.conf.ts`

If your configuration file has a different name or path, you can specify it using the `--config` option.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 