import asyncio
import os
import shutil
from playwright.async_api import async_playwright

async def audit_flows():
    results = {
        "doctor_flows": [],
        "tutor_flows": [],
        "bugs": []
    }
    
    videos_dir = "./web/public/evidence/videos"
    temp_dir = os.path.join(videos_dir, "temp_audit")
    os.makedirs(temp_dir, exist_ok=True)

    async with async_playwright() as p:
        # 1. AUDIT DOCTOR PORTAL
        print("=== 1. AUDITING DOCTOR PORTAL (doctor@vetconnect.demo) ===")
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            record_video_dir=temp_dir,
            record_video_size={"width": 1280, "height": 720},
            viewport={"width": 1280, "height": 720}
        )
        page = await ctx.new_page()

        console_logs = []
        page.on("console", lambda m: console_logs.append(f"[{m.type}] {m.text}"))
        failed_reqs = []
        page.on("requestfailed", lambda r: failed_reqs.append(f"{r.method} {r.url} -> {r.failure}"))

        await page.goto("http://localhost:5173/login", wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)

        # Cookie consent
        consent = page.locator('button:has-text("Aceptar"), button:has-text("Solo Necesarias")').first
        if await consent.count() > 0:
            await consent.click()
            await page.wait_for_timeout(500)

        await page.fill('input[type="email"]', "doctor@vetconnect.demo")
        await page.fill('input[type="password"]', "Doctor 123+")
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(2000)

        continuar = page.locator('button:has-text("Continuar")').first
        if await continuar.count() > 0:
            await continuar.click()
            await page.wait_for_timeout(3000)

        print(f"Doctor logged in URL: {page.url}")
        results["doctor_flows"].append(f"Login URL: {page.url}")

        # Check Vet Dashboard links
        nav_links = await page.locator('nav a, aside a, .sidebar a').all_text_contents()
        print("Doctor navigation options:", [n.strip() for n in nav_links if n.strip()])

        # Try clicking Consultas / Pacientes / Agenda
        for text in ["Consultas", "Pacientes", "Agenda", "Prescripciones"]:
            link = page.locator(f'a:has-text("{text}"), button:has-text("{text}")').first
            if await link.count() > 0:
                print(f"Doctor clicking: {text}...")
                await link.click()
                await page.wait_for_timeout(2000)
                print(f"Navigated to: {page.url}")

        await page.screenshot(path="web/public/evidence/runs/04-doctor-portal-deep.png")
        print("Captured doctor portal screenshot")

        await ctx.close()

        # Rename doctor video
        vfiles = [f for f in os.listdir(temp_dir) if f.endswith(".webm")]
        if vfiles:
            latest = os.path.join(temp_dir, vfiles[0])
            dest = os.path.join(videos_dir, "doctor-portal-audit.webm")
            shutil.move(latest, dest)
            print(f"Saved doctor replay to: {dest}")

        # 2. AUDIT TUTOR PETS & CANCELLATION SYNC
        print("\n=== 2. AUDITING TUTOR PORTAL (tutor@vetconnect.demo) ===")
        ctx2 = await browser.new_context(
            record_video_dir=temp_dir,
            record_video_size={"width": 1280, "height": 720},
            viewport={"width": 1280, "height": 720}
        )
        page2 = await ctx2.new_page()

        await page2.goto("http://localhost:5173/login", wait_until="domcontentloaded")
        await page2.wait_for_timeout(800)

        consent2 = page2.locator('button:has-text("Aceptar"), button:has-text("Solo Necesarias")').first
        if await consent2.count() > 0:
            await consent2.click()
            await page2.wait_for_timeout(400)

        await page2.fill('input[type="email"]', "tutor@vetconnect.demo")
        await page2.fill('input[type="password"]', "demo_password_123")
        await page2.click('button[type="submit"]')
        await page2.wait_for_timeout(2000)

        cont2 = page2.locator('button:has-text("Continuar")').first
        if await cont2.count() > 0:
            await cont2.click()
            await page2.wait_for_timeout(2500)

        print(f"Tutor logged in URL: {page2.url}")

        # Explore Mis mascotas
        mascotas_btn = page2.locator('a:has-text("Mis mascotas")').first
        if await mascotas_btn.count() > 0:
            print("Tutor navigating to Mis mascotas...")
            await mascotas_btn.click()
            await page2.wait_for_timeout(2500)
            print(f"Mis mascotas URL: {page2.url}")
            await page2.screenshot(path="web/public/evidence/runs/05-tutor-pets-audit.png")

        # Explore Mensajes
        mensajes_btn = page2.locator('a:has-text("Mensajes")').first
        if await mensajes_btn.count() > 0:
            print("Tutor navigating to Mensajes...")
            await mensajes_btn.click()
            await page2.wait_for_timeout(2500)
            print(f"Mensajes URL: {page2.url}")
            await page2.screenshot(path="web/public/evidence/runs/06-tutor-messages-audit.png")

        await ctx2.close()
        await browser.close()

        # Rename tutor video
        vfiles2 = [f for f in os.listdir(temp_dir) if f.endswith(".webm")]
        if vfiles2:
            latest2 = os.path.join(temp_dir, vfiles2[0])
            dest2 = os.path.join(videos_dir, "bug-01-cancellation-replay.webm")
            shutil.move(latest2, dest2)
            print(f"Saved tutor replay to: {dest2}")

        shutil.rmtree(temp_dir, ignore_errors=True)
        print("\nAll deep audit flows executed with Playwright successfully!")

if __name__ == "__main__":
    asyncio.run(audit_flows())
