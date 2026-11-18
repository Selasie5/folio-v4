// One-time Spotify sign-in: gets a refresh token so the site can read your listening.
//
// Before running:
//   1. Create an app at https://developer.spotify.com/dashboard (any name, "Web API").
//   2. In its settings, add this Redirect URI exactly:  http://127.0.0.1:8888/callback
//   3. Put its Client ID and Client Secret in .env.local as SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.
// Then run:  npm run spotify:auth   and sign in with Spotify in the browser window it opens.
//
// The refresh token is written straight into .env.local (never printed). Add the same three
// SPOTIFY_* values to your hosting provider (e.g. Vercel) for the live site.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { exec } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const root = fileURLToPath(new URL("../", import.meta.url));
nextEnv.loadEnvConfig(root);
const envFile = path.join(root, ".env.local");
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
assert(clientId && clientSecret, "Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local first (see the top of this file).");

const PORT = 8888;
const redirectUri = `http://127.0.0.1:${PORT}/callback`;
// Read-only access: what's playing, recently played, and Liked Songs.
const scopes = ["user-read-currently-playing", "user-read-recently-played", "user-library-read"];
const state = randomBytes(16).toString("hex");

const authorizeUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({ client_id: clientId, response_type: "code", redirect_uri: redirectUri, scope: scopes.join(" "), state });

function saveRefreshToken(token) {
  let env = "";
  try {
    env = readFileSync(envFile, "utf8");
  } catch {
    // No .env.local yet: it will be created.
  }
  const line = `SPOTIFY_REFRESH_TOKEN=${token}`;
  env = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(env)
    ? env.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, line)
    : `${env.replace(/\s*$/, "")}\n${line}\n`;
  writeFileSync(envFile, env);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", redirectUri);
  if (url.pathname !== "/callback") {
    response.writeHead(404).end();
    return;
  }
  const finish = (status, message) => {
    response.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
    response.end(`<p style="font-family:system-ui;padding:2rem">${message}</p>`);
    server.close();
  };
  if (url.searchParams.get("state") !== state) return finish(400, "State mismatch: please run the script again.");
  if (url.searchParams.get("error")) return finish(400, `Spotify said: ${url.searchParams.get("error")}. Run the script again.`);

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code: url.searchParams.get("code") ?? "", redirect_uri: redirectUri }),
  });
  const data = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !data.refresh_token) {
    console.error(`Token exchange failed (${tokenResponse.status}): ${data.error_description ?? data.error ?? "unknown error"}`);
    return finish(500, "Couldn't finish signing in. Check the terminal, then run the script again.");
  }
  saveRefreshToken(data.refresh_token);
  console.log("Connected. SPOTIFY_REFRESH_TOKEN was saved to .env.local (not shown here).");
  console.log("Add SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REFRESH_TOKEN to Vercel too, for the live site.");
  finish(200, "Spotify is connected. You can close this tab.");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Opening Spotify to sign in. If no browser window appears, open this link:");
  console.log(authorizeUrl);
  const opener = process.platform === "win32" ? `start "" "${authorizeUrl}"` : process.platform === "darwin" ? `open "${authorizeUrl}"` : `xdg-open "${authorizeUrl}"`;
  exec(opener);
});
