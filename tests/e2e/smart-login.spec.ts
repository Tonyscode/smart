import { smartTest } from '../../src/fixtures/smart.fixture';
import { allureHelper } from '../../src/helpers/allure.helper';
import { expect } from '@playwright/test';

const DK_USER = process.env.DK_USER!;
const SMART_PASSWORD = process.env.SMART_PASSWORD!;

// Serial mode prevents parallel auth requests to the dev server.
// mini-toastr notifications live only ~5.7 s; concurrent POST /api/v1/auth
// calls slow the server response and collapse the assertion window below 10 s.
smartTest.describe.configure({ mode: 'serial' });

smartTest.describe('Smart app — Login form', () => {
  // No storageState — the login form itself is under test

  smartTest.beforeEach(async ({ smartLogin }) => {
    await smartLogin.goto();
  });

  // ── Positive ────────────────────────────────────────────────────────────────
  smartTest('login as user with valid credentials @regression', async ({ smartLogin }) => {
    await allureHelper.addStep('Log in and navigate to My projects', async () => {
      allureHelper.setSeverity('blocker');
      allureHelper.addTag('auth', 'smoke', 'positive');
      allureHelper.addDescription('DK_USER can log in with valid credentials and reach the app.');
      await smartLogin.login(DK_USER, SMART_PASSWORD);
      await smartLogin.assertRedirectedToApp();
      await expect(smartLogin.page.getByTestId('dashboard')).toBeVisible();
    });
  });

  smartTest.skip('should log in with valid credentials @regression @smoke', async ({ smartLogin }) => {
    allureHelper.setSeverity('blocker');
    allureHelper.addTag('auth', 'smoke', 'positive');
    allureHelper.addDescription('DK_USER can log in with valid credentials and reach the app.');

    await allureHelper.addStep('Fill valid email and password', async () => {
      await smartLogin.fillEmail(DK_USER);
      await smartLogin.fillPassword(SMART_PASSWORD);
    });

    await allureHelper.addStep('Submit the form', async () => {
      await smartLogin.submit();
    });

    await allureHelper.addStep('Verify redirect to the app', async () => {
      await smartLogin.assertRedirectedToApp();
    });
  });


  // ── Negative — empty / missing fields ───────────────────────────────────────

  smartTest('should show error when both fields are empty @regression', async ({ smartLogin }) => {
    allureHelper.setSeverity('critical');
    allureHelper.addTag('auth', 'regression', 'negative', 'validation');
    allureHelper.addDescription('Submitting an empty form must not allow login.');

    await allureHelper.addStep('Click submit without filling any field', async () => {
      await smartLogin.submit();
    });

    await allureHelper.addStep('Verify error is shown and user stays on login page', async () => {
      await smartLogin.assertErrorVisible();
      await smartLogin.assertStaysOnLoginPage();
    });
  });

  smartTest('should show error when email is empty @regression', async ({ smartLogin }) => {
    allureHelper.setSeverity('normal');
    allureHelper.addTag('auth', 'regression', 'negative', 'validation');

    await allureHelper.addStep('Fill password only and submit', async () => {
      await smartLogin.fillPassword(SMART_PASSWORD);
      await smartLogin.submit();
    });

    await allureHelper.addStep('Verify error and stays on login page', async () => {
      await smartLogin.assertErrorVisible();
      await smartLogin.assertStaysOnLoginPage();
    });
  });

  smartTest('should show error when password is empty @regression', async ({ smartLogin }) => {
    allureHelper.setSeverity('normal');
    allureHelper.addTag('auth', 'regression', 'negative', 'validation');

    await allureHelper.addStep('Fill email only and submit', async () => {
      await smartLogin.fillEmail(DK_USER);
      await smartLogin.submit();
    });

    await allureHelper.addStep('Verify error and stays on login page', async () => {
      await smartLogin.assertErrorVisible();
      await smartLogin.assertStaysOnLoginPage();
    });
  });

  // ── Negative — invalid format ────────────────────────────────────────────────

  smartTest('should show error for invalid email format — missing @ @regression', async ({ smartLogin }) => {
    allureHelper.setSeverity('normal');
    allureHelper.addTag('auth', 'regression', 'negative', 'validation');

    await allureHelper.addStep('Enter a string without @ as email and submit', async () => {
      await smartLogin.fillEmail('notanemail');
      await smartLogin.fillPassword(SMART_PASSWORD);
      await smartLogin.submit();
    });

    await allureHelper.addStep('Verify error and stays on login page', async () => {
      await smartLogin.assertErrorVisible();
      await smartLogin.assertStaysOnLoginPage();
    });
  });

  smartTest('should show error for invalid email format — missing domain @regression', async ({ smartLogin }) => {
    allureHelper.setSeverity('minor');
    allureHelper.addTag('auth', 'regression', 'negative', 'validation');

    await allureHelper.addStep('Enter email without domain part and submit', async () => {
      await smartLogin.fillEmail('user@');
      await smartLogin.fillPassword(SMART_PASSWORD);
      await smartLogin.submit();
    });

    await allureHelper.addStep('Verify error and stays on login page', async () => {
      await smartLogin.assertErrorVisible();
      await smartLogin.assertStaysOnLoginPage();
    });
  });

  smartTest('should show error for email with spaces only @regression', async ({ smartLogin }) => {
    allureHelper.setSeverity('minor');
    allureHelper.addTag('auth', 'regression', 'negative', 'boundary');

    await allureHelper.addStep('Enter spaces-only email and submit', async () => {
      await smartLogin.fillEmail('   ');
      await smartLogin.fillPassword(SMART_PASSWORD);
      await smartLogin.submit();
    });

    await allureHelper.addStep('Verify error and stays on login page', async () => {
      await smartLogin.assertErrorVisible();
      await smartLogin.assertStaysOnLoginPage();
    });
  });

  // ── Negative — wrong credentials ─────────────────────────────────────────────

  smartTest('should show error for correct email and wrong password @regression', async ({ smartLogin }) => {
    allureHelper.setSeverity('critical');
    allureHelper.addTag('auth', 'regression', 'negative');
    allureHelper.addDescription('Valid email with an incorrect password must not authenticate the user.');

    await allureHelper.addStep('Fill valid email and wrong password, submit', async () => {
      await smartLogin.login(DK_USER, 'WrongPassword123');
    });

    await allureHelper.addStep('Verify error and stays on login page', async () => {
      await smartLogin.assertWrongCredentials('Sign-in failed. Please check your credentials and try again.');
      await smartLogin.assertStaysOnLoginPage();
    });
  });

  smartTest('should show error for non-registered email @regression', async ({ smartLogin }) => {
    allureHelper.setSeverity('normal');
    allureHelper.addTag('auth', 'regression', 'negative');

    await allureHelper.addStep('Fill unknown email and valid password, submit', async () => {
      await smartLogin.fillEmail('nonexistent.qa.user@example.com');
      await smartLogin.fillPassword(SMART_PASSWORD);
      await smartLogin.submit();
    });

    await allureHelper.addStep('Verify error and stays on login page', async () => {
      await smartLogin.assertWrongCredentials('Sign-in failed. Please check your credentials and try again.');
      await smartLogin.assertStaysOnLoginPage();
    });
  });

  smartTest('should show error for password with spaces only @regression', async ({ smartLogin }) => {
    allureHelper.setSeverity('minor');
    allureHelper.addTag('auth', 'regression', 'negative', 'boundary');

    await allureHelper.addStep('Fill valid email and space-only password, submit', async () => {
      await smartLogin.fillEmail(DK_USER);
      await smartLogin.fillPassword('   ');
      await smartLogin.submit();
    });

    await allureHelper.addStep('Verify error and stays on login page', async () => {
      await smartLogin.assertErrorVisible();
      await smartLogin.assertStaysOnLoginPage();
    });
  });

  // ── UI / Security ────────────────────────────────────────────────────────────

  smartTest('should display all login form elements on page load @regression @smoke', async ({ smartLogin }) => {
    allureHelper.setSeverity('normal');
    allureHelper.addTag('auth', 'smoke', 'ui');

    await allureHelper.addStep('Verify form fields and submit button are visible', async () => {
      await smartLogin.assertLoginFormVisible();
    });
  });

  smartTest('should mask the password input @regression', async ({ smartLogin }) => {
    allureHelper.setSeverity('minor');
    allureHelper.addTag('auth', 'regression', 'ui', 'security');
    allureHelper.addDescription('Password field must have type="password" to prevent shoulder surfing.');

    await allureHelper.addStep('Verify password field is masked', async () => {
      await smartLogin.assertPasswordMasked();
    });
  });

  smartTest('should have a forgot password link @regression', async ({ smartLogin }) => {
    allureHelper.setSeverity('trivial');
    allureHelper.addTag('auth', 'regression', 'ui');

    await allureHelper.addStep('Verify forgot password link is visible', async () => {
      await expect(smartLogin.forgotPasswordLink).toBeVisible();
    });
  });
});
