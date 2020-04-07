"use strict";

import "./index.html";

import * as electron from "electron";
import * as path from "path";
import * as puppeteer from "puppeteer-core";

import * as chromeCookies from "./cookies";

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: electron.BrowserWindow | null;

// Scheme must be registered before the app is ready
electron.protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);

const createChromeBrowser = async () => {
  try {
    const chromeBrowser = await puppeteer.launch({
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      // userDataDir: path.resolve(path.join(process.env.HOME || "", "Library/Application Support/Google/Chrome")),
      headless: false,
    });

    const twitterCookies = chromeCookies.cookies("twitter.com");
    const twitterPage = await chromeBrowser.newPage();
    for (const cookie of twitterCookies) {
      await twitterPage.setCookie(cookie);
    }
    await twitterPage.goto("https://twitter.com/home");
    await twitterPage.addStyleTag({ content: `* {background: red;}` });

    const facebookCookies = chromeCookies.cookies("facebook.com");
    const facebookPage = await chromeBrowser.newPage();
    for (const cookie of facebookCookies) {
      await facebookPage.setCookie(cookie);
    }
    await facebookPage.goto("https://www.facebook.com");
    await facebookPage.addStyleTag({ content: `* {background: red;}` });
  } catch (error) {
    console.error(error);
  }
};

const createSlackBrowser = async () => {
  try {
    const slackBrowser = await puppeteer.launch({
      executablePath: "/Applications/Slack.app/Contents/MacOS/Slack",
      userDataDir: path.resolve(path.join(process.env.HOME || "", "Library/Application Support/Slack")),
      headless: false,
    });
    const pages = await slackBrowser.pages();

    pages.forEach(async page => {
      await page.waitFor(1000);
      await page.addStyleTag({ content: `* {background: red;}` });
    });
  } catch (error) {
    console.error(error);
  }
};

const createDiscordBrowser = async () => {
  try {
    const discordBrowser = await puppeteer.launch({
      executablePath: "/Applications/Discord.app/Contents/MacOS/discord",
      userDataDir: path.resolve(path.join(process.env.HOME || "", "Library/Application Support/Discord")),
      headless: false,
    });
    const pages = await discordBrowser.pages();

    pages.forEach(async page => {
      await page.waitFor(1000);
      await page.addStyleTag({ content: `* {background: red;}` });
    });
  } catch (error) {
    console.error(error);
  }
};

const createWindow = async () => {
  // Create the browser window.
  win = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL(`file://${__dirname}/index.html`);

  win.on("closed", () => {
    win = null;
  });
};

// Quit when all windows are closed.
electron.app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});

electron.app.on("activate", async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    await createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron.app.on("ready", async () => {
  await createWindow();

  await createChromeBrowser();
  await createSlackBrowser();
  await createDiscordBrowser();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        electron.app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      electron.app.quit();
    });
  }
}
