import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getCompressedScreenSnapshot, getDriver } from "./util.js";

const server = new McpServer(
  {
    name: "iPhone-use",
    version: "0.1.0",
  },
  {
    instructions: "Use this server to use iPhone.",
  }
);

server.registerTool(
  "click_element_by_coordinates",
  {
    title: "Click Element by center coordinates of the target element",
    description: `Click element by coordinates, x and y are the central coordinates of the target element.
   
     Before calling this tool, you MUST follow these steps, and after completing them, call this tool 'click_element_by_coordinates' to click the center coordinates of the target element:
     1. Use get_screen_snapshot to obtain the current screen snapshot, the UI elements on the screen, and the screen size.
     2. Locate the target element from the UI elements.
     3. Calculate the center coordinates of the target element using its properties: '((x + width/2), (y + height/2))'.
     4. Check whether the center coordinates of the target element are within the screen size range. If not, recalculate. If after three attempts the coordinates are still out of bounds, inform the user and stop the process.
     
     You MUST calculate the center coordinates using the properties of the target element. It is strictly forbidden to estimate the center coordinates visually!
     `,
    inputSchema: {
      x: z
        .number()
        .describe("the x coordinate of the center of the target element"),
      y: z
        .number()
        .describe("the y coordinate of the center of the target element"),
    },
  },
  async ({ x, y }) => {
    try {
      let driver = await getDriver();
      await driver.execute("mobile: tap", { x: x, y: y });

      return {
        content: [
          { type: "text", text: "click at ${x}, ${y} of the screen success" },
        ],
      };
    } catch (e) {
      console.error(e);
      return {
        content: [
          {
            type: "text",
            text: `click at ${x}, ${y} of the screen failed, error: ${e}`,
          },
        ],
      };
    }
  }
);

server.registerTool(
  "get_screen_snapshot",
  {
    title: "Get Device Screen Snapshot",
    description: `Get the current iPhone screen data.

      The response is a JSON array string containing the following three parts:
      1. The current iPhone screen snapshot, as a base64-encoded PNG image.
      2. The UI elements on the current screen, including each element's type, label, coordinates, size, and other properties.
      3. The screen size, including the width and height of the current iPhone screen.
      `,
    inputSchema: {},
  },
  async () => {
    try {
      let driver = await getDriver();
      const compressedBase64PNG = await getCompressedScreenSnapshot();
      const uiElements = await driver.getPageSource();
      const screenRect = await driver.getWindowRect();

      const screenSize = { width: screenRect.width, height: screenRect.height };
      return {
        content: [
          { type: "image", data: compressedBase64PNG, mimeType: "image/png" }, // screen snapshot
          { type: "text", text: uiElements }, // ui elements
          { type: "text", text: JSON.stringify(screenSize) }, // screen size
        ],
      };
    } catch (e) {
      console.error(e);
      return {
        content: [
          { type: "text", text: `get screen snapshot failed, error: ${e}` },
        ],
      };
    }
  }
);

server.registerTool(
  "get_app_list",
  {
    title: "Get App List",
    description:
      "List installed apps and return an json array string of {name: string, bundleId: string}",
    inputSchema: {},
  },
  async () => {
    try {
      let driver = await getDriver();

      // helper to call listApps
      const listByType = async (type: "User" | "System") => {
        try {
          return await driver.execute("mobile: listApps", {
            applicationType: type,
          });
        } catch (e) {
          console.error(e);
          return [];
        }
      };

      let result: { displayName: string; bundleId: string }[] = [];

      const formatAppList = (
        list: any
      ): { displayName: string; bundleId: string }[] => {
        if (list && typeof list === "object") {
          return Object.entries(list).map(([bid, info]: [string, any]) => {
            const displayName =
              info.name ??
              info.displayName ??
              info.CFBundleDisplayName ??
              info.CFBundleName ??
              bid;
            return { displayName, bundleId: bid };
          });
        }

        return [];
      };

      const userApps = formatAppList(await listByType("User"));
      const systemApps = formatAppList(await listByType("System"));

      result.push(...userApps);
      result.push(...systemApps);

      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    } catch (e) {
      console.error(e);
      return {
        content: [{ type: "text", text: `get app list failed, error: ${e}` }],
      };
    }
  }
);

server.registerTool(
  "open_app_by_bundle_id",
  {
    title: "Open App by Bundle Id",
    description: "Open app by bundle id",
    inputSchema: { bundleId: z.string() },
  },
  async ({ bundleId }) => {
    try {
      let driver = await getDriver();
      await driver.execute("mobile: activateApp", { bundleId });

      return {
        content: [{ type: "text", text: `open ${bundleId} success` }],
      };
    } catch (e) {
      console.error(e);
      return {
        content: [
          { type: "text", text: `open app by bundle id failed, error: ${e}` },
        ],
      };
    }
  }
);

server.registerTool(
  "input_by_keyboard",
  {
    title: "Input by Keyboard",
    description: "Input by keyboard",
    inputSchema: { text: z.string() },
  },
  async ({ text }) => {
    try {
      let driver = await getDriver();

      const actions = Array.from(text).flatMap((ch) => [
        { type: "keyDown", value: ch } as const,
        { type: "keyUp", value: ch } as const,
      ]);
      await driver.performActions([{ type: "key", id: "kbd", actions }]);
      await driver.releaseActions();

      return {
        content: [{ type: "text", text: `input ${text} success` }],
      };
    } catch (e) {
      console.error(e);
      return {
        content: [
          { type: "text", text: `input by keyboard failed, error: ${e}` },
        ],
      };
    }
  }
);

async function main() {
  if (process.env.NODE_ENV !== "dev") {
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    console.warn = () => {};
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("iPhone Use MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
