import asyncio
from playwright.async_api import async_playwright

async def verify_other_pages():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto("http://localhost:5174/#dashboard", wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)

        # Bug Tracker
        bug_btn = page.locator('aside.sidebar').last.locator('button:has-text("Bug Tracker")')
        await bug_btn.click()
        await page.wait_for_timeout(1500)
        await page.screenshot(path="C:/Users/usuario/Documents/tobitests/web/public/evidence/page-bug-tracker.png", full_page=True)
        print("Captured Bug Tracker page screenshot")

        # La Oficina
        office_btn = page.locator('aside.sidebar').last.locator('button:has-text("La Oficina")')
        await office_btn.click()
        await page.wait_for_timeout(1500)
        await page.screenshot(path="C:/Users/usuario/Documents/tobitests/web/public/evidence/page-office.png", full_page=True)
        print("Captured Office page screenshot")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_other_pages())
