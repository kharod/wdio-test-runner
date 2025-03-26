# WebdriverIO Test Runner UI

A standalone UI for running WebdriverIO tests with a visual interface.

## Features

- Web-based UI for running WebdriverIO tests
- Real-time test output
- Support for running specific tests or test suites
- Headless mode support
- Works with any WebdriverIO project

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
  -t, --test-pattern <pattern>  Pattern to find test files (default: "**/*.spec.{js,ts}")
  -d, --directory <directory>   Directory to search for tests (default: current directory)
  -e, --exclude <pattern>       Pattern to exclude (can be used multiple times) (default: ["**/node_modules/**"])
  -c, --config <file>           Path to wdio config file
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

## Integration with CI/CD

You can use this tool in CI/CD pipelines by running it in a headless browser mode:

```bash
wdio-test-runner-ui start --config path/to/wdio.ci.conf.js
```

Make sure your WebdriverIO config is set up for headless browser testing.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 