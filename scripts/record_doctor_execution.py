import asyncio
import os
import shutil
from playwright.async_api import async_playwright

async def record_doctor():
    videos_dir = "C:/Users/usuario/Documents/tobitests/web/public/evidence/videos"
    os.makedirs(videos_dir, exist_ok=True)
    temp_video_dir = os.path.join(videos_dir, "temp_doc")
    os.makedirs(temp_video_dir, exist_ok=True)

    print("Launching Chromium to record Doctor login & audit...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            record_video_dir=temp_video_dir,
            record_video_size={"width": 1280, "height": 720},
            viewport={"width": 1280, "height": 720}
        )
        page = await context.new_page()

        try:
            print("1. Navigating to Login...")
            await page.goto("http://localhost:5173/login", wait_until="networkidle")
            await page.wait_for_timeout(1000)

            print("2. Trying Doctor credentials (doctor@gmail.com)...")
            await page.fill('input[type="email"], input[name="email"]', "doctor@gmail.com")
            await page.wait_for_timeout(500)
            
            # Try Doctor 123+ first
            await page.fill('input[type="password"], input[name="password"]', "Doctor 123+")
            await page.wait_for_timeout(800)
            submit_btn = page.locator('button[type="submit"], button:has-text("Ingresar")').first
            await submit_btn.click()
            await page.wait_for_timeout(2500)
            print("URL after 'Doctor 123+':", page.url)

            if page.url.endswith("/login"):
                # Try without space
                print("Trying password without space: Doctor123+...")
                await page.fill('input[type="password"], input[name="password"]', "Doctor123+")
                await submit_btn.click()
                await page.wait_for_timeout(2500)
                print("URL after 'Doctor123+':", page.url)

            # Wait to capture doctor portal/view
            await page.wait_for_timeout(3000)
            print("Doctor session recorded successfully!")

        except Exception as e:
            print(f"Error during doctor flow: {e}")

        await context.close()
        await browser.close()

    # Move video
    video_files = [f for f in os.listdir(temp_video_dir) if f.endswith(".webm")]
    if video_files:
        latest_video = os.path.join(temp_video_dir, video_files[0])
        target_path = os.path.join(videos_dir, "doctor-portal-audit.webm")
        if os.path.exists(target_path):
            os.remove(target_path)
        shutil.move(latest_video, target_path)
        print(f"Recorded Doctor video saved to: {target_path}")
        shutil.rmtree(temp_video_dir, ignore_errors=True)

if __name__ == "__main__":
    asyncio.run(record_doctor())
