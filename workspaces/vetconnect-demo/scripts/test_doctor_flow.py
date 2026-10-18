import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        page.on("response", lambda r: print(f"RES {r.status}: {r.url}"))
        page.on("console", lambda m: print(f"CONSOLE: {m.text}"))

        await page.goto("http://localhost:5173/login", wait_until="networkidle")
        
        consent = page.locator('button:has-text("Aceptar"), button:has-text("Solo Necesarias")').first
        if await consent.count() > 0:
            await consent.click()

        await page.fill('input[type="email"]', "doctor@vetconnect.demo")
        await page.fill('input[type="password"]', "Doctor123+")
        await page.click('button[type="submit"]')
        
        # Wait up to 10 seconds and check DOM
        for i in range(10):
            await page.wait_for_timeout(1000)
            print(f"[{i}s] URL: {page.url}")
            continuar = page.locator('button:has-text("Continuar")').first
            if await continuar.count() > 0:
                print("Clicking Continuar...")
                await continuar.click()
                await page.wait_for_timeout(2500)
                print("After Continuar URL:", page.url)
                break

        await page.screenshot(path="web/public/evidence/runs/doctor-logged-in.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
