"use strict";

import "./index.html";

import * as electron from "electron";
import * as path from "path";
import * as puppeteer from "puppeteer-core";

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let menuWindow: electron.BrowserWindow | null;
let twitterWindow: electron.BrowserWindow | null;
let facebookWindow: electron.BrowserWindow | null;

const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

// Scheme must be registered before the app is ready
electron.protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);

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

const getTweetDatetime = () => {
  const tweetElement = document.querySelector("section > div > div > div > div");
  if (!tweetElement || !tweetElement.textContent) return "";

  const timeElement = tweetElement.querySelector("time");
  const datetime = timeElement && timeElement.getAttribute("datetime");

  return datetime || "";
};

const twitterSpeech = () => {
  const voice =
    window.speechSynthesis.getVoices().find(voice => {
      return voice.name === "Google　日本語";
    }) || speechSynthesis.getVoices()[0];

  const speak = (voice: SpeechSynthesisVoice, text: string) => {
    const speechSynthesisUtterance = new SpeechSynthesisUtterance();
    speechSynthesisUtterance.voice = voice;

    const audio = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(audio);

    return new Promise(resolve => {
      audio.onend = resolve;
    });
  };

  const sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

  const exec = async () => {
    try {
      const tweetElement = document.querySelector("section > div > div > div > div");
      if (!tweetElement || !tweetElement.textContent) return;

      await speak(voice, "Twitter");

      const ltrElement = tweetElement.querySelector("[role=link] [dir=ltr]");
      const ltr = ltrElement && ltrElement.textContent;
      if (ltr) {
        await speak(voice, ltr);
      }

      const autoElement = tweetElement.querySelector("[role=link] [dir=auto]");
      const auto = autoElement && autoElement.textContent;
      if (auto) {
        await speak(voice, auto);
      }

      await speak(voice, "ツイート内容");
      await sleep(1000);
      const commentElement = tweetElement.querySelector("[lang]");
      const comment = commentElement && commentElement.textContent;
      if (comment) await speak(voice, comment);

      const groupElement = tweetElement.querySelector("[role=group] [aria-label]");
      const group = groupElement && groupElement.getAttribute("aria-label");
      if (group && group !== "返信") {
        await speak(voice, group);
      }
    } catch (error) {
      console.error(error);
    } finally {
      await sleep(4000);
      location.reload();
    }
  };

  exec();
};

const createTwitterWindow = async () => {
  // Create the browser window.
  twitterWindow = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  const url = "https://twitter.com/home";
  twitterWindow.loadURL(url);

  let latestDatetime: null | string;

  twitterWindow.webContents.on("did-stop-loading", async () => {
    if (!twitterWindow) return;

    const href = await twitterWindow.webContents.executeJavaScript("location.href", true);
    if (href !== url) return;

    await sleep(5000);
    const datetime = await twitterWindow.webContents.executeJavaScript(
      `var getTweetDatetime = ${getTweetDatetime.toString()};getTweetDatetime();`,
      true,
    );

    if (latestDatetime !== datetime) {
      latestDatetime = datetime;
      await twitterWindow.webContents.executeJavaScript(
        `var twitterSpeech = ${twitterSpeech.toString()};twitterSpeech();`,
        true,
      );
    } else {
      twitterWindow.webContents.reload();
    }
  });

  twitterWindow.on("closed", () => {
    twitterWindow = null;
  });
};

const createFacebookWindow = async () => {
  // Create the browser window.
  facebookWindow = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  facebookWindow.loadURL("https://www.facebook.com");

  facebookWindow.on("closed", () => {
    facebookWindow = null;
  });
};

const createMenuWindow = async () => {
  // Create the browser window.
  menuWindow = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  menuWindow.loadURL(`file://${__dirname}/index.html`);

  menuWindow.on("closed", () => {
    menuWindow = null;
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
  if (menuWindow === null) {
    await createMenuWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron.app.on("ready", async () => {
  await createMenuWindow();

  // await createSlackBrowser();
  // await createDiscordBrowser();
});

electron.ipcMain.on("createTwitterWindow", async () => {
  await createTwitterWindow();
});

electron.ipcMain.on("createFacebookWindow", async () => {
  await createFacebookWindow();
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
