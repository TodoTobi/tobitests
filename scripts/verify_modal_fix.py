from playwright.sync_api import sync_playwright
import sys

sys.stdout.reconfigure(encoding="utf-8")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.goto("http://localhost:5173")
        page.wait_for_timeout(1000)
        
        # If on landing, click enter
        cta = page.locator("button:has-text('Abrir Dashboard'), button:has-text('Entrar'), button:has-text('Dashboard')").first
        if cta.is_visible():
            cta.click()
            page.wait_for_timeout(600)
            
        print("Nav items:", page.locator(".nav-item").all_inner_texts())
        
        # Click Test Runs using semantic role
        page.get_by_role("button", name="Test Runs").click()
        page.wait_for_timeout(600)
        
        # Click on the first run row
        page.locator("table tbody tr.clickable").first.click()
        page.wait_for_timeout(600)
        
        # Click on the first test item in the list (which immediately opens the TestDetailModal)
        page.locator(".test-result").first.click()
        page.wait_for_timeout(700)
        
        # Check modal details
        pill = page.locator(".stage-floating-step-badge").inner_text()
        alert = page.locator(".analysis-alert-banner p").inner_text()
        btn_bug = page.locator(".btn-create-bug").inner_text()
        
        print("PILL:", pill)
        print("ALERT:", alert)
        print("BUG_BTN:", btn_bug)
        
        page.screenshot(path="web/public/evidence/runs/modal-step-3-fixed.png")
        print("Captured modal-step-3-fixed.png")
        
        # Click Ejecutar prueba
        page.locator(".btn-run-test-primary").click()
        page.wait_for_timeout(800)
        
        status_pill = page.locator(".test-status-pill").inner_text()
        alert_after = page.locator(".analysis-alert-banner strong").inner_text()
        print("STATUS_AFTER:", status_pill)
        print("ALERT_AFTER:", alert_after)
        
        page.screenshot(path="web/public/evidence/runs/modal-rerun-fixed.png")
        print("Captured modal-rerun-fixed.png")
        
        browser.close()

if __name__ == "__main__":
    main()
