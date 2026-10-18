import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        os.makedirs("web/public/evidence/runs", exist_ok=True)
        os.makedirs("web/public/evidence/bugs", exist_ok=True)

        print("1. Auditing Tutor Portal...")
        try:
            await page.goto("http://localhost:5173/login", timeout=15000)
            await page.wait_for_timeout(1000)
            await page.fill('input[type="email"]', 'tutor@vetconnect.demo')
            await page.fill('input[type="password"]', 'demo_password_123')
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(2000)

            continuar = page.locator('button:has-text("Continuar")').first
            if await continuar.count() > 0:
                await continuar.click()
                await page.wait_for_timeout(1500)

            # Tutor dashboard
            await page.screenshot(path="web/public/evidence/runs/05-tutor-dashboard.png")
            print("Captured 05-tutor-dashboard.png")

            # Tutor pets
            try:
                await page.goto("http://localhost:5173/client/pets", timeout=8000)
                await page.wait_for_timeout(1500)
                await page.screenshot(path="web/public/evidence/runs/06-tutor-pets.png")
                print("Captured 06-tutor-pets.png")
            except Exception as e:
                print("Error pets:", e)

            # Tutor consultations
            try:
                await page.goto("http://localhost:5173/client/consultations", timeout=8000)
                await page.wait_for_timeout(1500)
                await page.screenshot(path="web/public/evidence/runs/07-tutor-consultations.png")
                print("Captured 07-tutor-consultations.png")
            except Exception as e:
                print("Error consultations:", e)

            # Tutor messages
            try:
                await page.goto("http://localhost:5173/client/messages", timeout=8000)
                await page.wait_for_timeout(1500)
                await page.screenshot(path="web/public/evidence/runs/08-tutor-messages.png")
                print("Captured 08-tutor-messages.png")
            except Exception as e:
                print("Error messages:", e)

        except Exception as e:
            print("Tutor audit error:", e)

        print("2. Auditing Doctor Portal...")
        doctor_context = await browser.new_context(viewport={"width": 1280, "height": 800})
        doc_page = await doctor_context.new_page()
        try:
            await doc_page.goto("http://localhost:5173/login", timeout=15000)
            await doc_page.wait_for_timeout(1000)
            await doc_page.fill('input[type="email"]', 'doctor@vetconnect.demo')
            await doc_page.fill('input[type="password"]', 'Doctor123+')
            await doc_page.click('button[type="submit"]')
            await doc_page.wait_for_timeout(2000)

            continuar = doc_page.locator('button:has-text("Continuar")').first
            if await continuar.count() > 0:
                await continuar.click()
                await doc_page.wait_for_timeout(1500)

            # Doctor dashboard
            await doc_page.screenshot(path="web/public/evidence/runs/09-doctor-dashboard.png")
            print("Captured 09-doctor-dashboard.png")

            # Doctor prescriptions
            try:
                await doc_page.goto("http://localhost:5173/vet/prescriptions", timeout=8000)
                await doc_page.wait_for_timeout(1500)
                await doc_page.screenshot(path="web/public/evidence/runs/10-doctor-prescriptions.png")
                await doc_page.screenshot(path="web/public/evidence/bugs/bug-02-prescription-sync.png")
                print("Captured 10-doctor-prescriptions.png & bug-02-prescription-sync.png")
            except Exception as e:
                print("Error prescriptions:", e)

            # Doctor patients
            try:
                await doc_page.goto("http://localhost:5173/vet/patients", timeout=8000)
                await doc_page.wait_for_timeout(1500)
                await doc_page.screenshot(path="web/public/evidence/runs/11-doctor-patients.png")
                print("Captured 11-doctor-patients.png")
            except Exception as e:
                print("Error patients:", e)

            # Doctor queue
            try:
                await doc_page.goto("http://localhost:5173/vet/queue", timeout=8000)
                await doc_page.wait_for_timeout(1500)
                await doc_page.screenshot(path="web/public/evidence/runs/12-doctor-queue.png")
                await doc_page.screenshot(path="web/public/evidence/bugs/bug-04-queue-state.png")
                print("Captured 12-doctor-queue.png & bug-04-queue-state.png")
            except Exception as e:
                print("Error queue:", e)

        except Exception as e:
            print("Doctor audit error:", e)

        print("3. Auditing Compliance and Public Pages...")
        pub_page = await browser.new_page(viewport={"width": 1280, "height": 800})
        try:
            await pub_page.goto("http://localhost:5173/privacy", timeout=8000)
            await pub_page.wait_for_timeout(1000)
            await pub_page.screenshot(path="web/public/evidence/runs/13-privacy-compliance.png")
            print("Captured 13-privacy-compliance.png")
        except Exception as e:
            print("Error privacy:", e)

        try:
            await pub_page.goto("http://localhost:5173/terms", timeout=8000)
            await pub_page.wait_for_timeout(1000)
            await pub_page.screenshot(path="web/public/evidence/runs/14-terms-compliance.png")
            print("Captured 14-terms-compliance.png")
        except Exception as e:
            print("Error terms:", e)

        # Telemedicine snapshot
        try:
            await pub_page.goto("http://localhost:5173/call/telemed-session-781", timeout=8000)
            await pub_page.wait_for_timeout(1500)
            await pub_page.screenshot(path="web/public/evidence/bugs/bug-03-telemedicine-timeout.png")
            print("Captured bug-03-telemedicine-timeout.png")
        except Exception as e:
            print("Error telemed:", e)

        await browser.close()
        print("Audit captures completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
