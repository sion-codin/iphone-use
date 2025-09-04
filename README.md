# iPhone use

[![npm shield](https://img.shields.io/npm/v/@iphone-use/mcp)](https://www.npmjs.com/package/@iphone-use/mcp)

Make iPhone accessible to AI agents.

## Prerequisites
Xcode (15+)  
Apple developer account  
iPhone (iOS 17+)  

## QuickStart

**Configure your iPhone**
1. Enable Developer Mode: open Settings > Privacy & Security > Developer Mode. You can check [Enabling Developer Mode on a device](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device) for more information.
2. Enable Automation: open Settings -> Developer -> Enable UI Automation

**Install WDA**
1. Clone the [WebDriverAgent](https://github.com/appium/WebDriverAgent.git) repository and open it in Xcode
2. Select the WebDriverAgentRunner scheme
3. Select the scheme as Product -> Scheme -> WebDriverAgentRunner (or WebDriverAgentRunner_tvOS for tvOS)
4. Select your device in Product -> Destination
5. Select Product -> Test to build and install the WDA app

You should now see "Automation Running" on your iPhone screen

**Configure MCP Server**

1. Open Xcode, select Window -> Devices and Simulators, select your target device in the side panel, and you will see the "Identifier" of the device. **Fill this value into the config below**.

2. Install the iPhoneUSE MCP server with your client.

```JSON
{
  "mcpServers": {
    "iPhone-use": {
      "command": "npx",
      "args": [
        "-y",
        "@iphone-use/mcp"
      ],
      "env": {
        "TARGET_IPHONE_UDID": ... // Replace with the Identifier of the target device
      }
    }
  }
}
```

## Credits
We would like to thank the following projects:  
[xcuitest-driver Source Code](https://github.com/appium/appium-xcuitest-driver/)  
[xcuitest-driver Document](https://appium.github.io/appium-xcuitest-driver/latest/)

