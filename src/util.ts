import { XCUITestDriver } from "appium-xcuitest-driver";
import sharp from "sharp";

let driver: XCUITestDriver | null = null;


export function getTargetDeviceUDID() {
  if (!process.env.TARGET_IPHONE_UDID) {
    throw new Error("TARGET_IPHONE_UDID is not set,you must set it in the environment variable,read more: https://github.com/sion-codin/iPhone-use");
  }

  return process.env.TARGET_IPHONE_UDID;
}

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
      "appium:udid": getTargetDeviceUDID(),
    },
  };

  // create session
  await driver.createSession(capabilities, null, null, []);
  return driver;
}

export async function getDriver(): Promise<XCUITestDriver> {
  if (driver) {
    return driver;
  }

  driver = await createDriver();
  return driver;
}

export async function getCompressedScreenSnapshot(): Promise<string> {
  try {
    let driver = await getDriver();
    const base64PNG = await driver.getScreenshot();
    const pngBuffer = Buffer.from(base64PNG, "base64");

    const compressedPNGBuffer = await sharp(pngBuffer)
      .png({
        palette: true,
        colours: 16,
        compressionLevel: 9,
        adaptiveFiltering: true,
        dither: 1.0,
        force: true,
      })
      .withMetadata({})
      .toBuffer();

    return compressedPNGBuffer.toString("base64");
  } catch (e) {
    console.error(e);
    throw e;
  }
}
