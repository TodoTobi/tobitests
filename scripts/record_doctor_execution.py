import asyncio
import os
import shutil
from playwright.async_api import async_playwright

async def record_doctor():
    videos_dir = "C:/Users/usuario/Documents/tobitests/web/public/evidence/videos"
    os.makedirs(videos_dir, exist_ok=True)
    temp_dir = os.path.join(videos_dir, "temp_doc")
    os.makedirs(temp_dir, exist_ok=True)

    print("Launching Chromium with video recording for Doctor Portal...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            record_video_dir=temp_dir,
            record_video_size={"width": 1280, "height": 720},
            viewport={"width": 1280, "height": 720}
        )
        page = await ctx.new_page()

        try:
            print("1. Navigating to VetConnect Login...")
            await page.goto("http://localhost:5173/login", wait_until="networkidle")
            await page.wait_for_timeout(1000)

            consent = page.locator('button:has-text("Aceptar"), button:has-text("Solo Necesarias")').first
            if await consent.count() > 0:
                await consent.click()
                await page.wait_for_timeout(400)

            print("2. Filling Doctor credentials (doctor@gmail.com / Doctor123+)...")
            await page.fill('input[type="email"]', "doctor@gmail.com")
            await page.wait_for_timeout(500)
            await page.fill('input[type="password"]', "Doctor123+")
            await page.wait_for_timeout(600)

            print("3. Submitting login form...")
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(2000)

            continuar = page.locator('button:has-text("Continuar")').first
            if await continuar.count() > 0:
                print("Clicking Continuar...")
                await continuar.click()
                await page.wait_for_timeout(2500)

            print(f"Doctor logged in successfully! URL: {page.url}")

            # Explore Doctor navigation
            for section in ["Consultas", "Pacientes", "Agenda", "Cola de atención"]:
                link = page.locator(f'a:has-text("{section}"), button:has-text("{section}")').first
                if await link.count() > 0:
                    print(f"Navigating to {section}...")
                    await link.click()
                    await page.wait_for_timeout(2000)

            # Toggle doctor state to 'En consulta' or 'Disponible'
            state_btn = page.locator('button:has-text("En consulta")').first
            if await state_btn.count() > 0:
                print("Toggling doctor state to En consulta...")
                await state_btn.click()
                await page.wait_for_timeout(1500)

            disp_btn = page.locator('button:has-text("Disponible")').first
            if await disp_btn.count() > 0:
                print("Toggling back to Disponible...")
                await disp_btn.click()
                await page.wait_for_timeout(1500)

            await page.wait_for_timeout(2000)
            print("Doctor portal audit completed!")

        except Exception as e:
            print(f"Error during doctor flow: {e}")

        await ctx.close()
        await browser.close()

    # Move video
    vfiles = [f for f in os.listdir(temp_dir) if f.endswith(".webm")]
    if vfiles:
        latest = os.path.join(temp_dir, vfiles[0])
        dest = os.path.join(videos_dir, "doctor-portal-audit.webm")
        if os.path.exists(dest):
            os.remove(dest)
        shutil.move(latest, dest)
        print(f"Saved authentic Doctor replay to: {dest}")
        shutil.rmtree(temp_dir, ignore_errors=True)
    else:
        print("No video file created.")

if __name__ == "__main__":
    asyncio.run(record_doctor())
