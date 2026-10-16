import asyncio
import os
import shutil
from playwright.async_api import async_playwright

async def run_real_tobitests_audit():
    os.makedirs("web/public/evidence/runs", exist_ok=True)
    os.makedirs("web/public/evidence/bugs", exist_ok=True)
    os.makedirs("web/public/evidence/videos", exist_ok=True)

    temp_video_dir = "web/public/evidence/videos/temp"
    os.makedirs(temp_video_dir, exist_ok=True)

    print("Iniciando Chromium para auditar TobiTests en http://localhost:5173...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 800},
            record_video_dir=temp_video_dir,
            record_video_size={'width': 1280, 'height': 800}
        )
        page = await context.new_page()

        # 1. Landing Page
        print("1. Auditando Portada de TobiTests...")
        await page.goto("http://localhost:5173", wait_until="domcontentloaded")
        await asyncio.sleep(2.0)
        await page.screenshot(path="web/public/evidence/runs/tobi-01-landing.png", full_page=False)

        # 2. Entrar al Workspace -> Dashboard
        print("2. Entrando al Workspace y auditando Dashboard...")
        enter_btn = page.locator("button:has-text('Entrar al workspace')").first
        if await enter_btn.is_visible():
            await enter_btn.click()
        else:
            await page.click("button:has-text('Dashboard')")
        await page.wait_for_selector(".stat-row", timeout=5000)
        await asyncio.sleep(1.2)
        await page.screenshot(path="web/public/evidence/runs/tobi-02-dashboard.png", full_page=False)

        # 3. Bug Tracker
        print("3. Auditando Bug Tracker...")
        await page.locator(".app > aside.sidebar nav button:has-text('Bug Tracker')").click()
        await page.wait_for_selector(".table", timeout=5000)
        await asyncio.sleep(1.0)
        await page.screenshot(path="web/public/evidence/runs/tobi-03-bug-tracker.png", full_page=False)

        # 4. Detalle de Bug y Pestañas de Evidencia
        print("4. Inspeccionando BUG-01...")
        first_bug_row = page.locator(".table tbody tr.clickable").first
        await first_bug_row.click()
        await page.wait_for_selector(".bug-layout", timeout=5000)
        await asyncio.sleep(1.0)
        await page.screenshot(path="web/public/evidence/bugs/tobi-bug-01-detail.png", full_page=False)

        # 5. La Oficina (simulación 2.5D con agentes en movimiento)
        print("5. Entrando a La Oficina e interactuando con agentes...")
        await page.locator(".app > aside.sidebar nav button:has-text('La Oficina')").click()
        await page.wait_for_selector(".iso-studio", timeout=15000)
        # Dejamos 4 segundos para que se graben los personajes hablando y caminando en el video
        await asyncio.sleep(4.0)
        await page.screenshot(path="web/public/evidence/runs/tobi-04-office.png", full_page=False)

        # 6. Test Specs
        print("6. Auditando Test Specs...")
        await page.locator(".app > aside.sidebar nav button:has-text('Test Specs')").click()
        await page.wait_for_selector(".editor", timeout=5000)
        await asyncio.sleep(1.0)
        await page.screenshot(path="web/public/evidence/runs/tobi-05-specs.png", full_page=False)

        # 7. Live Run
        print("7. Auditando Live Run...")
        await page.locator(".app > aside.sidebar nav button:has-text('Live Run')").click()
        await page.wait_for_selector(".live-layout", timeout=5000)
        await asyncio.sleep(1.0)
        await page.screenshot(path="web/public/evidence/runs/tobi-06-live-run.png", full_page=False)

        # 8. Settings
        print("8. Auditando Settings y Herramientas MCP...")
        await page.locator(".app > aside.sidebar .sidebar-foot button:has-text('Settings')").click()
        await page.wait_for_selector(".panel-head", timeout=5000)
        await asyncio.sleep(1.0)
        await page.screenshot(path="web/public/evidence/runs/tobi-07-settings.png", full_page=False)

        print("Cerrando sesión y empaquetando video real...")
        video_path = await page.video.path()
        await page.close()
        await context.close()
        await browser.close()

        # Finalizar el video webm real
        if video_path and os.path.exists(video_path):
            target_video = "web/public/evidence/videos/tobitests-self-audit.webm"
            target_bug_video = "web/public/evidence/videos/tobitests-bug-01-replay.webm"
            shutil.copyfile(video_path, target_video)
            shutil.copyfile(video_path, target_bug_video)
            print(f"Video real guardado en: {target_video} y {target_bug_video}")
            try:
                shutil.rmtree(temp_video_dir)
            except Exception:
                pass

        print("¡Auditoría real de TobiTests finalizada con éxito!")

if __name__ == "__main__":
    asyncio.run(run_real_tobitests_audit())
