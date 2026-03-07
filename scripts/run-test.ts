import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';

import * as dotenv from 'dotenv';

const execAsync = promisify(exec);
dotenv.config();

interface TestResult {
  suite: string;
  passed: boolean;
  duration: number;
  tests: {
    name: string;
    passed: boolean;
    error?: string;
  }[];
}

interface NewmanOptions {
  collection: string;
  environment: string;
  folder: string;
  reporters: string[];
  reporterOptions: {
    json: {
      output: string;
    };
    junit: {
      output: string;
    };
    htmlextra: {
      output: string;
    };
  };
}

interface NewmanRun {
  run: {
    failures: unknown[];
    executions: NewmanExecution[];
  };
}

interface NewmanExecution {
  item: {
    name: string;
  };
  assertions?: NewmanAssertion[];
}

interface NewmanAssertion {
  error?: {
    message: string;
  };
}

interface Config {
  collectionId: string;
  environmentId: string;
  notifications?: NotificationsConfig;
}

interface NotificationsConfig {
  slack?: {
    webhook: string;
    onSuccess?: boolean;
  };
  email?: {
    recipients: string[];
    onSuccess?: boolean;
  };
}

interface SummaryReport {
  timestamp: string;
  totalSuites: number;
  passedSuites: number;
  failedSuites: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
}

async function runPostmanTests(): Promise<void> {
  console.log('🚀 Starting Postman Medical Records Tests...\n');

  try {
    // Read configuration
    const configPath = path.join(__dirname, '../.postman.json');
    const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // Check if API is running
    await checkApiHealth();

    // Create reports directory
    const reportsDir = path.join(__dirname, '../test-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const results: TestResult[] = [];

    // Run medical records test suite
    console.log('📋 Running Medical Records Test Suite...\n');

    const medicalResult = await runCollectionWithNewman({
      collection: config.collectionId,
      environment: config.environmentId,
      folder: 'Medical Records',
      reporters: ['cli', 'json', 'junit', 'htmlextra'],
      reporterOptions: {
        json: {
          output: path.join(reportsDir, `medical-results-${timestamp}.json`)
        },
        junit: {
          output: path.join(reportsDir, `medical-results-${timestamp}.xml`)
        },
        htmlextra: {
          output: path.join(reportsDir, `medical-report-${timestamp}.html`)
        }
      }
    });

    results.push(medicalResult);

    // Generate summary report
    generateSummaryReport(results, timestamp, reportsDir);

    // Send notifications if configured
    if (config.notifications) {
      await sendNotifications(results, config.notifications);
    }

    // Output results
    console.log('\n📊 Test Summary:');
    console.log('===============');
    for (const result of results) {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.suite}: ${result.passed ? 'PASSED' : 'FAILED'} (${result.duration}ms)`);
      for (const test of result.tests) {
        const testIcon = test.passed ? '  ✅' : '  ❌';
        console.log(`${testIcon} ${test.name}`);
        if (test.error) {
          console.log(`     Error: ${test.error}`);
        }
      }
    }

    // Exit with error if any tests failed
    const hasFailures = results.some(r => !r.passed);
    if (hasFailures) {
      console.log('\n❌ Some tests failed!');
      process.exit(1);
    }

    console.log('\n✅ All tests passed successfully!');
    console.log(`📈 Test reports saved to: ${reportsDir}/`);
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

async function runCollectionWithNewman(options: NewmanOptions): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const command = [
      'newman run',
      options.collection,
      '--environment',
      options.environment,
      '--folder',
      `"${options.folder}"`,
      '--reporters',
      options.reporters.join(','),
      '--reporter-json-export',
      `"${options.reporterOptions.json.output}"`,
      '--reporter-junit-export',
      `"${options.reporterOptions.junit.output}"`,
      '--reporter-htmlextra-export',
      `"${options.reporterOptions.htmlextra.output}"`,
      '--timeout-request 30000'
    ].join(' ');

    const { stdout, stderr } = await execAsync(command);

    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }

    // Parse results from JSON output
    const results: NewmanRun = JSON.parse(fs.readFileSync(options.reporterOptions.json.output, 'utf-8'));

    const tests = results.run.executions.map((execution: NewmanExecution) => {
      const failedAssertion = execution.assertions?.find((assertion: NewmanAssertion) => assertion.error);
      return {
        name: execution.item.name,
        passed: !failedAssertion,
        error: failedAssertion?.error?.message
      };
    });

    return {
      suite: options.folder,
      passed: results.run.failures.length === 0,
      duration: Date.now() - startTime,
      tests
    };
  } catch {
    return {
      suite: options.folder,
      passed: false,
      duration: Date.now() - startTime,
      tests: []
    };
  }
}

async function checkApiHealth(): Promise<void> {
  try {
    await execAsync('curl -f http://localhost:3000/api/trpc/health -m 5');
    console.log('✅ API server is running\n');
  } catch {
    console.error('❌ API server is not running. Please start your Next.js app first.');
    console.log('   Run: npm run dev\n');
    process.exit(1);
  }
}

function generateSummaryReport(results: TestResult[], timestamp: string, reportsDir: string): void {
  const summary: SummaryReport = {
    timestamp: new Date().toISOString(),
    totalSuites: results.length,
    passedSuites: results.filter(r => r.passed).length,
    failedSuites: results.filter(r => !r.passed).length,
    totalTests: results.reduce((acc, r) => acc + r.tests.length, 0),
    passedTests: results.reduce((acc, r) => acc + r.tests.filter(t => t.passed).length, 0),
    failedTests: results.reduce((acc, r) => acc + r.tests.filter(t => !t.passed).length, 0),
    results
  };

  fs.writeFileSync(path.join(reportsDir, `summary-${timestamp}.json`), JSON.stringify(summary, null, 2));

  // Generate HTML summary
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Medical Records Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .pass { color: green; }
    .fail { color: red; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
    .suite { margin: 20px 0; padding: 10px; border: 1px solid #ddd; }
    .test { margin: 5px 20px; }
  </style>
</head>
<body>
  <h1>Medical Records API Test Report</h1>
  <div class="summary">
    <h2>Summary</h2>
    <p>Timestamp: ${summary.timestamp}</p>
    <p>Total Suites: ${summary.totalSuites}</p>
    <p>Passed Suites: <span class="pass">${summary.passedSuites}</span></p>
    <p>Failed Suites: <span class="fail">${summary.failedSuites}</span></p>
    <p>Total Tests: ${summary.totalTests}</p>
    <p>Passed Tests: <span class="pass">${summary.passedTests}</span></p>
    <p>Failed Tests: <span class="fail">${summary.failedTests}</span></p>
  </div>
  ${results
    .map(
      suite => `
    <div class="suite">
      <h3>${suite.suite} - ${suite.passed ? '✅ PASSED' : '❌ FAILED'} (${suite.duration}ms)</h3>
      ${suite.tests
        .map(
          test => `
        <div class="test">
          <span class="${test.passed ? 'pass' : 'fail'}">
            ${test.passed ? '✅' : '❌'} ${test.name}
          </span>
          ${test.error ? `<br><small style="color: red;">${test.error}</small>` : ''}
        </div>
      `
        )
        .join('')}
    </div>
  `
    )
    .join('')}
</body>
</html>
  `;

  fs.writeFileSync(path.join(reportsDir, `report-${timestamp}.html`), html);
}

async function sendNotifications(results: TestResult[], notifications: NotificationsConfig): Promise<void> {
  const hasFailures = results.some(r => !r.passed);

  if (notifications.slack?.webhook && (hasFailures || notifications.slack.onSuccess)) {
    await sendSlackNotification(results, notifications.slack.webhook);
  }

  if (notifications.email?.recipients && (hasFailures || notifications.email.onSuccess)) {
    await sendEmailNotification(notifications.email.recipients);
  }
}

async function sendSlackNotification(results: TestResult[], webhook: string): Promise<void> {
  const hasFailures = results.some(r => !r.passed);
  const payload = {
    text: hasFailures ? '❌ Medical Records API Tests Failed' : '✅ Medical Records API Tests Passed',
    attachments: results.map(r => ({
      color: r.passed ? 'good' : 'danger',
      title: r.suite,
      text:
        `${r.passed ? '✅ Passed' : '❌ Failed'} in ${r.duration}ms\n` +
        `Tests: ${r.tests.filter(t => t.passed).length}/${r.tests.length} passed`
    }))
  };

  // Implement Slack webhook call
  // await fetch(webhook, { method: 'POST', body: JSON.stringify(payload) })
  console.log('📧 Slack notification would be sent to:', webhook);
  console.log('Payload:', JSON.stringify(payload, null, 2));
}

async function sendEmailNotification(recipients: string[]): Promise<void> {
  // Implement email notification
  console.log('📧 Email notification would be sent to:', recipients.join(', '));
}

// Run the tests
void runPostmanTests();
