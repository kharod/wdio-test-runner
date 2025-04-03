# WebdriverIO Test Runner UI

A standalone UI for running WebdriverIO tests with a visual interface.

## Features

- Web-based UI for running WebdriverIO tests
- Real-time test output
- Support for running specific tests or test suites
- Headless mode support
- Works with any WebdriverIO project
- Always uses your project's WebdriverIO configuration
- Support for both `.spec.ts` and `.test.ts` files
- Auto-detection of tests in `tests` folder
- Support for projects with WebdriverIO in `integration/wdio` structure

## Installation

### Global Installation

```bash
npm install -g wdio-test-runner-ui
```

### Local Installation

```bash
npm install --save-dev wdio-test-runner-ui
```

## Usage

### Command Line

```bash
# Using global installation
wdio-test-runner-ui start

# Using local installation
npx wdio-test-runner-ui start
```

### Options

```
Usage: wdio-test-runner-ui start [options]

Start the WebdriverIO Test Runner UI

Options:
  -p, --port <port>             Port to run the server on (default: "3000")
  -t, --test-pattern <pattern>  Pattern to find test files (default: "**/*.{spec,test}.{js,ts}")
  -d, --directory <directory>   Directory to search for tests (default: current directory)
  -e, --exclude <pattern>       Pattern to exclude (can be used multiple times) (default: ["**/node_modules/**"])
  -c, --config <file>           Path to wdio config file (will auto-detect if not specified)
  -w, --wdio-path <path>        Path to WebdriverIO project relative to directory (default: "integration/wdio")
  -h, --help                    display help for command
```

### Examples

```bash
# Start with default settings
wdio-test-runner-ui start

# Specify a different port
wdio-test-runner-ui start --port 8080

# Specify a different test pattern
wdio-test-runner-ui start --test-pattern "**/*.e2e.js"

# Specify a different directory
wdio-test-runner-ui start --directory ./tests

# Specify a different WebdriverIO project path
wdio-test-runner-ui start --wdio-path ./custom/wdio/path

# Exclude multiple patterns
wdio-test-runner-ui start --exclude "**/node_modules/**" --exclude "**/fixtures/**"

# Specify a custom WebdriverIO config file
wdio-test-runner-ui start --config ./wdio.custom.conf.js
```

### Adding to your project scripts

You can add a script to your package.json for easy access:

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

## Project Structure Support

This tool supports different project structures:

### Standard WebdriverIO Project

```
project-root/
├── wdio.conf.js
├── tests/
│   └── example.spec.ts
```

### Project with WebdriverIO in integration/wdio

```
project-root/
├── integration/
│   └── wdio/
│       ├── wdio.conf.js
│       └── tests/
│           └── example.test.ts
```

The tool will automatically detect if your project follows the `integration/wdio` structure and will search for tests in that directory.

### Test File Naming Conventions

The tool supports both `.spec.ts` and `.test.ts` file extensions by default. You can customize this by using the `--test-pattern` option.

## Integration with CI/CD

You can use this tool in CI/CD pipelines by running it in a headless browser mode:

```bash
wdio-test-runner-ui start --config path/to/wdio.ci.conf.js
```

Make sure your WebdriverIO config is set up for headless browser testing.

## Configuration

This package does not use its own WebdriverIO configuration. It will always read and use your project's WebdriverIO configuration file. By default, it will look for:

- `wdio.conf.js`
- `wdio.conf.ts`
- `wdio.config.js`
- `wdio.config.ts`

If your configuration file has a different name or path, you can specify it using the `--config` option.

```bash
wdio-test-runner-ui start --config ./path/to/my-custom-wdio.conf.js
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 