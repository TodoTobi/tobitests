import asyncio
from playwright.async_api import async_playwright

async def capture_tutor():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        print("Navigating to login...")
        await page.goto("http://localhost:5173/login", wait_until="networkidle")
        
        consent = page.locator('button:has-text("Aceptar"), button:has-text("Solo Necesarias")').first
        if await consent.count() > 0:
            await consent.click()
            await page.wait_for_timeout(400)

        await page.fill('input[type="email"]', "tutor@vetconnect.demo")
        await page.fill('input[type="password"]', "demo_password_123")
        submit_btn = page.locator('button[type="submit"]').first
        await submit_btn.click()

        for _ in range(10):
            await page.wait_for_timeout(1000)
            continuar = page.locator('button:has-text("Continuar")').first
            if await continuar.count() > 0:
                await continuar.click()
                await page.wait_for_timeout(2000)
                break

        print("In dashboard:", page.url)
        # Click on "Mis consultas" or "Mensajes"
        consultas_link = page.locator('a:has-text("Mis consultas"), span:has-text("Mis consultas")').first
        if await consultas_link.count() > 0:
            print("Navigating to Mis consultas...")
            await consultas_link.click()
            await page.wait_for_timeout(2500)
            print("Current URL:", page.url)

        await page.screenshot(path="web/public/evidence/bugs/bug-01-divergence-evidence.png")
        print("Saved authentic Mis consultas screenshot to web/public/evidence/bugs/bug-01-divergence-evidence.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_tutor())
