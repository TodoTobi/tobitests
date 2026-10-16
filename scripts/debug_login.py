import asyncio
from playwright.async_api import async_playwright

async def debug_login():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        page.on("requestfailed", lambda req: print(f"REQ FAILED: {req.url} -> {req.failure}"))
        page.on("response", lambda res: print(f"RES: {res.status} {res.url}"))
        
        await page.goto("http://localhost:5173/login", wait_until="networkidle")
        await page.fill('input[type="email"]', "tobias@gmail.com")
        await page.fill('input[type="password"]', "Tobias123+")
        submit_btn = page.locator('button[type="submit"]')
        await submit_btn.click()
        await page.wait_for_timeout(4000)
        print("Final URL:", page.url)
        content = await page.content()
        print("Page text snippet:", content[1000:2000] if len(content) > 2000 else content)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_login())
