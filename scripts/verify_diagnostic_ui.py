import asyncio
from playwright.async_api import async_playwright

async def verify_ui():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        print("Navigating to http://localhost:5174/#dashboard...")
        await page.goto("http://localhost:5174/#dashboard", wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)

        # Target the visible desktop sidebar button
        diag_button = page.locator('aside.sidebar').last.locator('button:has-text("Diagnostic Studio")')
        print("Clicking visible Diagnostic Studio button in desktop sidebar...")
        await diag_button.click()
        await page.wait_for_timeout(2000)

        screenshot_path = "C:/Users/usuario/Documents/tobitests/web/public/evidence/diagnostic-studio-remodeled.png"
        await page.screenshot(path=screenshot_path, full_page=True)
        print("Captured full page screenshot of Diagnostic Studio to:", screenshot_path)

        # Toggle to Snapshot tab
        snapshot_tab = page.locator('button:has-text("Snapshot Real")').first
        if await snapshot_tab.count() > 0:
            print("Clicking Snapshot Real...")
            await snapshot_tab.click()
            await page.wait_for_timeout(1000)
            snapshot_tab_path = "C:/Users/usuario/Documents/tobitests/web/public/evidence/diagnostic-studio-snapshot-view.png"
            await page.screenshot(path=snapshot_tab_path, full_page=True)
            print("Captured snapshot tab screenshot to:", snapshot_tab_path)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_ui())
