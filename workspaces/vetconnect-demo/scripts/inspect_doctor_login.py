import asyncio
from playwright.async_api import async_playwright

async def inspect_doctor_login():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        errors = []
        page.on("console", lambda m: errors.append(f"CONSOLE: {m.text}"))
        page.on("response", lambda r: errors.append(f"RES {r.status}: {r.url}"))

        await page.goto("http://localhost:5173/login", wait_until="networkidle")
        
        consent = page.locator('button:has-text("Aceptar"), button:has-text("Solo Necesarias")').first
        if await consent.count() > 0:
            await consent.click()

        await page.fill('input[type="email"]', "doctor@vetconnect.demo")
        await page.fill('input[type="password"]', "Doctor 123+")
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(3000)

        print("URL after submit:", page.url)
        content = await page.content()
        # Find any error alerts or text
        alerts = await page.locator('.auth-field__message, .alert, .error, h1, h2').all_text_contents()
        print("Alerts/Headings on page:", alerts)

        # Print matching responses
        for line in errors[-10:]:
            print(line)

        await page.screenshot(path="web/public/evidence/runs/doctor-login-diagnostic.png")
        print("Screenshot saved to doctor-login-diagnostic.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(inspect_doctor_login())
