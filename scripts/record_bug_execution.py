import asyncio
import os
import shutil
from playwright.async_api import async_playwright

async def record_vetconnect_run():
    videos_dir = "C:/Users/usuario/Documents/tobitests/web/public/evidence/videos"
    os.makedirs(videos_dir, exist_ok=True)
    temp_video_dir = os.path.join(videos_dir, "temp")
    os.makedirs(temp_video_dir, exist_ok=True)

    print("Launching Chromium with video recording...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            record_video_dir=temp_video_dir,
            record_video_size={"width": 1280, "height": 720},
            viewport={"width": 1280, "height": 720}
        )
        page = await context.new_page()

        try:
            print("1. Navigating to VetConnect Login...")
            await page.goto("http://localhost:5173/login", wait_until="networkidle")
            await page.wait_for_timeout(1000)

            print("2. Filling Tutor credentials (tobias@gmail.com)...")
            await page.fill('input[type="email"], input[name="email"]', "tobias@gmail.com")
            await page.wait_for_timeout(500)
            await page.fill('input[type="password"], input[name="password"]', "Tobias123+")
            await page.wait_for_timeout(800)

            print("3. Submitting login form...")
            submit_btn = page.locator('button[type="submit"], button:has-text("Ingresar"), button:has-text("Iniciar Sesión")').first
            await submit_btn.click()
            await page.wait_for_timeout(2500)

            current_url = page.url
            print(f"Current URL after submit: {current_url}")

            print("4. Exploring /client dashboard or navigation...")
            await page.wait_for_timeout(1500)

            # Try navigating to Mensajes if present
            mensajes_link = page.locator('a:has-text("Mensajes"), button:has-text("Mensajes")').first
            if await mensajes_link.count() > 0:
                print("Clicking Mensajes...")
                await mensajes_link.click()
                await page.wait_for_timeout(2000)

            # Try navigating to Mascotas if present
            mascotas_link = page.locator('a:has-text("Mascotas"), button:has-text("Mascotas")').first
            if await mascotas_link.count() > 0:
                print("Clicking Mascotas...")
                await mascotas_link.click()
                await page.wait_for_timeout(2000)

            # Take a final moment so the user can see the dashboard in the video
            await page.wait_for_timeout(2000)
            print("Session completed successfully!")

        except Exception as e:
            print(f"Error during flow: {e}")

        # Close context to finalize video
        await context.close()
        await browser.close()

    # Move and rename the generated video
    video_files = [f for f in os.listdir(temp_video_dir) if f.endswith(".webm")]
    if video_files:
        latest_video = os.path.join(temp_video_dir, video_files[0])
        target_path = os.path.join(videos_dir, "bug-01-cancellation-replay.webm")
        if os.path.exists(target_path):
            os.remove(target_path)
        shutil.move(latest_video, target_path)
        print(f"Recorded video saved to: {target_path}")
        shutil.rmtree(temp_video_dir, ignore_errors=True)
    else:
        print("No video file was created.")

if __name__ == "__main__":
    asyncio.run(record_vetconnect_run())
