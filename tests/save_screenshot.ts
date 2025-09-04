import { XCUITestDriver } from "appium-xcuitest-driver";
import fs from "fs";

async function createDriver(): Promise<XCUITestDriver> {
    let driver = new XCUITestDriver();
  
    // create session like webdriverio
    // https://appium.github.io/appium-xcuitest-driver/latest/reference/capabilities/
    const capabilities = {
      firstMatch: [{}],
      alwaysMatch: {
        platformName: "iOS",
        "appium:automationName": "XCUITest",
        "appium:includeSafariInWebviews": true,
        // target device information
        "appium:deviceName": "iPhone 13 Pro",
        "appium:platformVersion": "18.2",
        "appium:udid": "00008110-001E688A0242801E",
      },
    };
  
    // create session
    await driver.createSession(capabilities, null, null, []);
    return driver;
}

async function main() {
    let driver = await createDriver();
    const base64 = await driver.getScreenshot();
    fs.writeFileSync("screenshot.png", Buffer.from(base64, "base64"));
}

main();