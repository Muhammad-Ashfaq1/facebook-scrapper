import csv
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager

# Function to connect to the existing Chrome session using remote debugging
def connect_to_existing_browser():
    chrome_options = Options()
    chrome_options.add_argument("--remote-debugging-port=9222")  # Connect to existing Chrome session
    chrome_options.add_argument("--headless")  # Optional, to run without a UI (you can remove this if you want to see the browser)

    # Connect to the existing Chrome session (does not open a new window)
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    return driver

# Function to wait for an element to be present in the DOM
def wait_for_element(driver, xpath, timeout=20):
    try:
        return WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.XPATH, xpath))
        )
    except TimeoutException:
        print("Element not found within time frame.")
        return None

# Function to scrape the Facebook group member data
def scrape_facebook_group(members_url):
    # Connect to the existing browser (no new window will be opened)
    driver = connect_to_existing_browser()

    try:
        # Open the Facebook members page directly
        driver.get(members_url)
        time.sleep(5)

        # Wait for the members list to load
        print("Waiting for members list to load...")
        wait_for_element(driver, "//div[@role='main']", timeout=20)
        print("Members list loaded, scraping data...")

        # Scroll the page to load more members
        all_members = []
        for _ in range(5):  # Scroll 5 times, adjust as necessary
            print(f"Scrolling {(_+1)}...")
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(5)  # Wait for content to load

        # Extract the member information based on the provided structure
        member_elements = driver.find_elements(By.XPATH, "//div[@role='main']//a[contains(@href, '/user/') or contains(@href, '/profile.php')]")

        if not member_elements:
            print("No member elements found. The page may have a different structure.")
            return

        for member in member_elements:
            try:
                # Extract name and profile URL
                name = member.text
                profile_url = member.get_attribute("href")

                # Extract additional info (if available)
                additional_info = member.find_element(By.XPATH, "./following-sibling::span").text if member.find_element(By.XPATH, "./following-sibling::span") else "N/A"

                all_members.append({
                    'name': name,
                    'profile_url': profile_url,
                    'additional_info': additional_info
                })
                print(f"Scraped member: {name}")

            except Exception as e:
                print(f"Error extracting data for a member: {e}")

        # Save the members data to CSV
        save_to_csv(all_members)

    finally:
        driver.quit()

# Save the extracted member data into a CSV file
def save_to_csv(members):
    with open("facebook_members.csv", "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=["name", "profile_url", "additional_info"])
        writer.writeheader()
        for member in members:
            writer.writerow(member)
    print("Members data saved to facebook_members.csv")

if __name__ == "__main__":
    # Ask for the Facebook members page URL
    members_url = input("Enter the Facebook members page URL: ")
    scrape_facebook_group(members_url)
