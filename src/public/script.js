document.addEventListener('DOMContentLoaded', () => {
  // Socket.io connection
  const socket = io();
  
  // DOM elements
  const testFilesList = document.getElementById('test-files-list');
  const testOutput = document.getElementById('test-output');
  const testStatus = document.getElementById('test-status');
  const lastRunTime = document.getElementById('last-run-time');
  const currentTestInfo = document.getElementById('current-test-info');
  const currentTestFile = document.getElementById('current-test-file');
  const currentTestSpec = document.getElementById('current-test-spec');
  const runAllTestsBtn = document.getElementById('run-all-tests');
  const stopTestsBtn = document.getElementById('stop-tests');
  const refreshTestsBtn = document.getElementById('refresh-tests');
  const clearOutputBtn = document.getElementById('clear-output');
  const headlessModeToggle = document.getElementById('headless-mode-toggle');
  
  // Test Summary elements
  const testsPassed = document.getElementById('tests-passed');
  const testsFailed = document.getElementById('tests-failed');
  const passProgress = document.getElementById('pass-progress');
  const failProgress = document.getElementById('fail-progress');
  const testDuration = document.getElementById('test-duration');
  const testCount = document.getElementById('test-count');
  
  // State
  let isTestRunning = false;
  let selectedTestFile = null;
  let selectedSpec = null;
  let testSummary = {
    passed: 0,
    failed: 0,
    total: 0,
    startTime: null,
    endTime: null
  };
  
  // Event listeners
  testFilesList.addEventListener('click', handleTestFileClick);
  runAllTestsBtn.addEventListener('click', handleRunAllTests);
  stopTestsBtn.addEventListener('click', handleStopTests);
  refreshTestsBtn.addEventListener('click', handleRefreshTests);
  clearOutputBtn.addEventListener('click', handleClearOutput);
  
  // Socket.io event handlers
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
  socket.on('test:start', handleTestStart);
  socket.on('test:log', handleTestLog);
  socket.on('test:complete', handleTestComplete);
  socket.on('test:error', handleTestError);
  
  // Handle test file click
  function handleTestFileClick(event) {
    event.preventDefault();
    
    const testFileItem = event.target.closest('.test-file');
    const specItem = event.target.closest('.spec-item');
    
    if (testFileItem && !specItem) {
      // Toggle specs list with animation
      const specsList = testFileItem.querySelector('.specs-list');
      if (specsList) {
        if (specsList.classList.contains('d-none')) {
          // Show the specs list with animation
          specsList.classList.remove('d-none');
          specsList.style.maxHeight = '0';
          setTimeout(() => {
            specsList.style.maxHeight = specsList.scrollHeight + 'px';
          }, 10);
        } else {
          // Hide the specs list with animation
          specsList.style.maxHeight = '0';
          setTimeout(() => {
            specsList.classList.add('d-none');
          }, 300); // Match the CSS transition duration
        }
      }
      
      // Select the test file
      selectedTestFile = testFileItem.dataset.file;
      selectedSpec = null;
      
      // Update UI
      updateCurrentTestInfo();
    } else if (specItem) {
      // Get the test file and spec
      const testFileItem = specItem.closest('.test-file');
      selectedTestFile = testFileItem.dataset.file;
      selectedSpec = specItem.dataset.spec;
      
      // Update UI
      updateCurrentTestInfo();
      
      // Run the test
      runTest(selectedTestFile, selectedSpec);
    }
  }
  
  // Run all tests
  function handleRunAllTests() {
    if (isTestRunning) return;
    
    const testFiles = Array.from(document.querySelectorAll('.test-file'))
      .map(el => el.dataset.file);
      
    if (testFiles.length === 0) {
      appendToOutput('No test files found', 'stderr');
      return;
    }
    
    // Clear output and reset test summary
    clearOutput();
    resetTestSummary();
    
    // Run tests sequentially
    runTestSequence(testFiles);
  }
  
  // Run a sequence of tests
  async function runTestSequence(testFiles) {
    for (const file of testFiles) {
      selectedTestFile = file;
      selectedSpec = null;
      updateCurrentTestInfo();
      
      // Run the test and wait for completion
      await new Promise(resolve => {
        const completeHandler = (data) => {
          // Update test summary based on test result
          updateTestSummary(data.success);
          
          socket.off('test:complete', completeHandler);
          socket.off('test:error', errorHandler);
          resolve();
        };
        
        const errorHandler = () => {
          // Update test summary for error case
          updateTestSummary(false);
          
          socket.off('test:complete', completeHandler);
          socket.off('test:error', errorHandler);
          resolve();
        };
        
        socket.on('test:complete', completeHandler);
        socket.on('test:error', errorHandler);
        
        runTest(file);
      });
    }
  }
  
  // Stop tests
  function handleStopTests() {
    socket.emit('stop-test');
    setRunningState(false);
    testStatus.textContent = 'Stopped';
    testStatus.className = 'test-failure';
    
    // Update test summary end time
    testSummary.endTime = new Date();
    updateTestSummaryDisplay();
  }
  
  // Refresh tests
  function handleRefreshTests() {
    fetch('/api/tests')
      .then(response => response.json())
      .then(data => {
        // Reload the page to refresh the test files list
        window.location.reload();
      })
      .catch(error => {
        appendToOutput(`Error refreshing tests: ${error.message}`, 'stderr');
      });
  }
  
  // Clear output
  function handleClearOutput() {
    clearOutput();
  }
  
  // Clear the test output
  function clearOutput() {
    testOutput.innerHTML = '';
  }
  
  // Reset test summary
  function resetTestSummary() {
    testSummary = {
      passed: 0,
      failed: 0,
      total: 0,
      startTime: new Date(),
      endTime: null
    };
    updateTestSummaryDisplay();
  }
  
  // Update test summary with test result
  function updateTestSummary(success) {
    testSummary.total++;
    if (success) {
      testSummary.passed++;
    } else {
      testSummary.failed++;
    }
    testSummary.endTime = new Date();
    updateTestSummaryDisplay();
  }
  
  // Update test summary display
  function updateTestSummaryDisplay() {
    testsPassed.textContent = `${testSummary.passed} Passed`;
    testsFailed.textContent = `${testSummary.failed} Failed`;
    testCount.textContent = `Total: ${testSummary.total}`;
    
    // Calculate pass/fail percentages
    const totalTests = testSummary.total || 1; // Avoid division by zero
    const passPercent = (testSummary.passed / totalTests) * 100;
    const failPercent = (testSummary.failed / totalTests) * 100;
    
    // Update progress bars
    passProgress.style.width = `${passPercent}%`;
    failProgress.style.width = `${failPercent}%`;
    
    // Calculate and display test duration
    if (testSummary.startTime && testSummary.endTime) {
      const duration = Math.round((testSummary.endTime - testSummary.startTime) / 1000);
      testDuration.textContent = `Duration: ${duration}s`;
    } else {
      testDuration.textContent = 'Duration: 0s';
    }
  }
  
  // Run a test
  function runTest(testFile, spec) {
    if (isTestRunning) return;
    
    clearOutput();
    setRunningState(true);
    
    // If this is a single test run, reset the test summary
    if (!testSummary.startTime) {
      resetTestSummary();
    }
    
    // Get headless mode from toggle
    const headless = headlessModeToggle.checked;
    
    // Add headless mode information to the output
    appendToOutput(`Mode: ${headless ? 'Headless' : 'UI (Browser visible)'}`, 'stdout');
    
    socket.emit('run-test', { testFile, spec, headless });
  }
  
  // Handle test start
  function handleTestStart(data) {
    const { testFile, spec, headless } = data;
    
    appendToOutput(`Running test: ${testFile}${spec ? ` (${spec})` : ''}`, 'stdout');
    appendToOutput(`Mode: ${headless ? 'Headless' : 'UI (Browser visible)'}`, 'stdout');
    testStatus.textContent = 'Running';
    testStatus.className = 'test-running';
    lastRunTime.textContent = new Date().toLocaleTimeString();
  }
  
  // Handle test log
  function handleTestLog(data) {
    const { type, content } = data;
    appendToOutput(content, type);
  }
  
  // Handle test complete
  function handleTestComplete(data) {
    const { success, exitCode } = data;
    
    setRunningState(false);
    
    if (success) {
      appendToOutput('Test completed successfully', 'stdout');
      testStatus.textContent = 'Passed';
      testStatus.className = 'test-success';
    } else {
      appendToOutput(`Test failed with exit code: ${exitCode}`, 'stderr');
      testStatus.textContent = 'Failed';
      testStatus.className = 'test-failure';
    }
  }
  
  // Handle test error
  function handleTestError(data) {
    const { error } = data;
    
    setRunningState(false);
    appendToOutput(`Error running test: ${error}`, 'stderr');
    testStatus.textContent = 'Error';
    testStatus.className = 'test-failure';
  }
  
  // Update current test info
  function updateCurrentTestInfo() {
    if (selectedTestFile) {
      currentTestInfo.classList.remove('d-none');
      currentTestFile.textContent = selectedTestFile;
      currentTestSpec.textContent = selectedSpec || '';
    } else {
      currentTestInfo.classList.add('d-none');
    }
  }
  
  // Append content to the output with animation
  function appendToOutput(content, type) {
    const logItem = document.createElement('div');
    logItem.className = `log-item log-${type}`;
    logItem.textContent = content;
    
    // Add fade-in animation
    logItem.style.opacity = '0';
    testOutput.appendChild(logItem);
    
    // Force reflow for animation
    void logItem.offsetWidth;
    
    // Apply fade-in
    logItem.style.opacity = '1';
    
    testOutput.scrollTop = testOutput.scrollHeight;
  }
  
  // Set the running state
  function setRunningState(running) {
    isTestRunning = running;
    runAllTestsBtn.disabled = running;
    stopTestsBtn.disabled = !running;
    headlessModeToggle.disabled = running;
  }
}); 