const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  try {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    console.log('Login page loaded:', page.url());
    await page.fill('input[type="email"]', 'tutor@vetconnect.demo');
    await page.fill('input[type="password"]', 'demo_password_123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    console.log('Navigated to:', page.url());
    await page.screenshot({ path: 'web/public/evidence/bugs/bug-01-actual-app.png' });
    console.log('Screenshot saved to web/public/evidence/bugs/bug-01-actual-app.png');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
})();
