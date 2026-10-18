import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("Navigating to http://localhost:5173...")
        page.goto("http://localhost:5173", wait_until="domcontentloaded")
        page.wait_for_timeout(2000)

        # Click on 'Entrar al workspace' button
        btn = page.get_by_text("Entrar al workspace").first
        if btn.is_visible():
            btn.click()
            page.wait_for_timeout(1000)

        # Open project switcher in AppHeader
        proj_btn = page.locator(".app-header button").filter(has_text="TobiTests").first
        if not proj_btn.is_visible():
            proj_btn = page.locator(".sidebar button").filter(has_text="TobiTests").first

        print("Clicking project switcher button...")
        proj_btn.click()
        page.wait_for_timeout(500)

        # Click "+ Agregar Proyecto"
        add_btn = page.get_by_text("+ Agregar Proyecto").first
        print("Clicking '+ Agregar Proyecto'...")
        add_btn.click()
        page.wait_for_timeout(500)

        # Take screenshot of the modal open
        page.screenshot(path="web/public/evidence/runs/add-project-modal.png")
        print("Captured screenshot: web/public/evidence/runs/add-project-modal.png")

        # Fill in test project details
        page.fill('input[placeholder*="Mi Super App"]', "Mi Ecommerce Tienda")
        page.fill('input[placeholder*="./workspace"]', "./workspace")
        page.fill('input[placeholder*="http://localhost:5173"]', "http://localhost:3000")
        page.wait_for_timeout(300)

        # Submit modal
        page.get_by_text("Vincular y Cargar Workspace").click()
        page.wait_for_timeout(1000)

        # Take screenshot of the newly loaded project workspace
        page.screenshot(path="web/public/evidence/runs/custom-project-workspace.png")
        print("Captured screenshot: web/public/evidence/runs/custom-project-workspace.png")

        print("Current header title/env:", page.locator(".app-header").text_content())

        browser.close()

if __name__ == "__main__":
    run()
