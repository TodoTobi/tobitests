import os
from playwright.sync_api import sync_playwright

def verify_reports():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("Navigating to http://localhost:5173...")
        page.goto("http://localhost:5173", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)

        # Enter workspace
        btn = page.get_by_text("Entrar al workspace").first
        if btn.is_visible():
            btn.click()
            page.wait_for_timeout(1000)

        # Switch to VetConnect project
        proj_btn = page.locator(".app-header button").filter(has_text="TobiTests").first
        if not proj_btn.is_visible():
            proj_btn = page.locator("aside.sidebar button").filter(has_text="TobiTests").last

        proj_btn.click()
        page.wait_for_timeout(500)

        # Click VetConnect in popover
        page.locator("button").filter(has_text="VetConnect").first.click()
        page.wait_for_timeout(1000)

        # Open Bug Tracker via visible desktop sidebar navigation
        page.locator("aside.sidebar").last.locator("button.nav-item").filter(has_text="Bug Tracker").click()
        page.wait_for_timeout(1000)

        # Click on BUG-01
        page.locator("tr.clickable").filter(has_text="BUG-01").click()
        page.wait_for_timeout(1000)

        # Click on 'Plantillas BDD' tab button in .tabs-line
        page.locator(".tabs-line button").filter(has_text="Plantillas BDD").click()
        page.wait_for_timeout(800)

        # Take screenshot of Plantillas tab with AST-grounded files
        os.makedirs("web/public/evidence/bugs", exist_ok=True)
        page.screenshot(path="web/public/evidence/bugs/vetconnect-bug01-grounded.png")
        print("Captured screenshot successfully: web/public/evidence/bugs/vetconnect-bug01-grounded.png")

        # Click 'Exportar reporte'
        os.makedirs("web/public/downloads", exist_ok=True)
        with page.expect_download() as download_info:
            page.locator("button").filter(has_text="Exportar reporte").first.click()
        download = download_info.value
        download_path = "web/public/downloads/master-bug-report-vetconnect.md"
        download.save_as(download_path)
        print("Saved report successfully to:", download_path)

        browser.close()

if __name__ == "__main__":
    verify_reports()
