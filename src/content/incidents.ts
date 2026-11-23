/**
 * Incident write-ups, rendered by /incidents as interactive timelines.
 *
 * Everything here is public: client names, hostnames, IP addresses, credentials and tenant names
 * are left out or replaced with neutral placeholders (portal.example, db-host).
 */

export type IncidentPhase = "symptom" | "investigate" | "cause" | "fix" | "verify" | "followup";

export const PHASES: Record<IncidentPhase, { label: string }> = {
  symptom: { label: "Symptom" },
  investigate: { label: "Investigate" },
  cause: { label: "Root cause" },
  fix: { label: "Fix" },
  verify: { label: "Verify" },
  followup: { label: "Follow-up" },
};

export interface EvidenceLine {
  /** "cmd" lines get a prompt; "out" lines are output; "hl" lines are output worth noticing. */
  kind: "cmd" | "out" | "hl";
  text: string;
}

export interface IncidentStep {
  /** Minutes since the first report. */
  at: number;
  phase: IncidentPhase;
  title: string;
  body: string;
  /** The one-line lesson this step taught, shown as a callout. */
  insight?: string;
  evidence?: EvidenceLine[];
}

export interface Incident {
  slug: string;
  title: string;
  summary: string;
  date: string;
  environment: string;
  duration: string;
  impact: string;
  rootCause: string;
  resolution: string;
  stack: string[];
  steps: IncidentStep[];
  lessons: string[];
}

export const incidents: Incident[] = [
  {
    slug: "the-cors-error-that-wasnt",
    title: "The CORS error that wasn't",
    summary:
      "A client portal failed every API call with a CORS error. The allowlist was fine: the API behind it was down, and so was its database.",
    date: "2026-11-23",
    environment: "Staging · fintech client portal",
    duration: "Under an hour of hands-on work",
    impact: "Every request from the client portal to its API failed in the browser, so the portal was unusable.",
    rootCause:
      "The portal's Node.js API had dropped out of its process manager, and the database host it pointed to no longer accepted connections, so it couldn't come back up.",
    resolution:
      "Moved the API onto a fresh MySQL database on its own server, let the ORM rebuild the schema, restored tenant data, and brought it back under PM2.",
    stack: ["Nginx", "Node.js", "Express", "PM2", "MySQL", "Sequelize", "Linux"],
    steps: [
      {
        at: 0,
        phase: "symptom",
        title: "Every API call fails with “blocked by CORS policy”",
        body: "The portal loads, but each request to its API is rejected in the browser. The ask was simple: add the portal's domain to the API's CORS allowlist and restart.",
        evidence: [
          { kind: "out", text: "Access to fetch at 'https://portal-api.example/…' from origin" },
          { kind: "out", text: "'https://portal.example' has been blocked by CORS policy:" },
          { kind: "hl", text: "No 'Access-Control-Allow-Origin' header is present on the requested resource." },
        ],
      },
      {
        at: 6,
        phase: "investigate",
        title: "The allowlist already had the origin",
        body: "The portal talks to two backends. The CORS config of both already listed the portal's origin, and a preflight to the gateway came back with the right header. Changing config would have changed nothing.",
        evidence: [
          { kind: "cmd", text: "curl -si -X OPTIONS https://gateway.example/ -H 'Origin: https://portal.example' \\" },
          { kind: "cmd", text: "  -H 'Access-Control-Request-Method: POST' | grep -i '^HTTP\\|access-control-allow-origin'" },
          { kind: "out", text: "HTTP/1.1 200 OK" },
          { kind: "out", text: "Access-Control-Allow-Origin: https://portal.example" },
        ],
      },
      {
        at: 9,
        phase: "investigate",
        title: "The other backend answered 502, not 403",
        body: "The same preflight to the portal API returned 502 Bad Gateway. That response came from Nginx, not the app, and Nginx's error page carries no CORS headers. The browser can only say “CORS”.",
        insight: "A 502 with no CORS headers looks exactly like a CORS failure in the browser. Read the status code before touching the allowlist.",
        evidence: [
          { kind: "cmd", text: "curl -si -X OPTIONS https://portal-api.example/ -H 'Origin: https://portal.example' …" },
          { kind: "hl", text: "HTTP/1.1 502 Bad Gateway" },
        ],
      },
      {
        at: 12,
        phase: "investigate",
        title: "The API wasn't running at all",
        body: "The process manager listed one app, and it wasn't this one. Nothing was listening on the API's port, and its logs had stopped weeks earlier. It had quietly dropped out of PM2 and was never saved back.",
        evidence: [
          { kind: "cmd", text: "pm2 list" },
          { kind: "out", text: "│ 0 │ file-bucket │ fork │ online │" },
          { kind: "cmd", text: "ss -ltn | grep :<api-port> || echo 'not listening'" },
          { kind: "hl", text: "not listening" },
        ],
      },
      {
        at: 15,
        phase: "investigate",
        title: "Restarting it started a crash loop",
        body: "Starting the API under PM2 failed within a second and kept restarting. I stopped it so a restart storm wouldn't flood the logs, and read why.",
        evidence: [
          { kind: "cmd", text: "pm2 start ecosystem.config.js --env production" },
          { kind: "out", text: "Unable to connect or sync database:" },
          { kind: "hl", text: "SequelizeConnectionRefusedError: connect ECONNREFUSED <db-host>:3306" },
          { kind: "cmd", text: "pm2 stop portal-api" },
        ],
      },
      {
        at: 20,
        phase: "cause",
        title: "Its database host had stopped accepting connections",
        body: "The database server was alive (SSH answered) but refused MySQL on every port. Nobody with access to that machine was available, so bringing it back wasn't an option.",
        insight: "Check the layer below the one that's failing. The API was fine; it had nothing to stand on.",
        evidence: [
          { kind: "cmd", text: "for p in 22 3306 33060; do timeout 4 bash -c \"</dev/tcp/<db-host>/$p\" && echo \"$p open\" || echo \"$p refused\"; done" },
          { kind: "out", text: "22 open" },
          { kind: "hl", text: "3306 refused" },
          { kind: "hl", text: "33060 refused" },
        ],
      },
      {
        at: 28,
        phase: "fix",
        title: "A fresh database on the API's own server",
        body: "The app server already ran MySQL, but the portal's database had never been imported there, and its root password was unavailable. Using MySQL's recovery mode (no networking, switched off straight after), I created an empty database and a least-privilege user for the app, then pointed the API at it. On startup the ORM created the schema itself.",
        evidence: [
          { kind: "cmd", text: "pm2 restart portal-api --update-env && pm2 logs portal-api --nostream" },
          { kind: "out", text: "CREATE TABLE IF NOT EXISTS `portal_roles` …" },
          { kind: "out", text: "CREATE TABLE IF NOT EXISTS `portal_users` …" },
          { kind: "out", text: "CREATE TABLE IF NOT EXISTS `portal_companies` …" },
          { kind: "hl", text: "Portal backend listening on port <api-port>" },
        ],
      },
      {
        at: 31,
        phase: "verify",
        title: "CORS verified end to end, both ways",
        body: "The portal's origin now gets a 204 preflight with the right headers. An origin that isn't on the list gets no header, so the allowlist still does its job. Then the process list was saved so the API survives a restart.",
        evidence: [
          { kind: "cmd", text: "curl -si -X OPTIONS https://portal-api.example/ -H 'Origin: https://portal.example' …" },
          { kind: "out", text: "HTTP/1.1 204 No Content" },
          { kind: "hl", text: "Access-Control-Allow-Origin: https://portal.example" },
          { kind: "cmd", text: "curl -si -X OPTIONS https://portal-api.example/ -H 'Origin: https://not-allowed.example' …" },
          { kind: "out", text: "(no Access-Control-Allow-Origin header)" },
          { kind: "cmd", text: "pm2 save" },
        ],
      },
      {
        at: 40,
        phase: "followup",
        title: "Restoring tenants surfaced a silent schema bug",
        body: "The tenant sync script worked for one tenant and failed for another with only “failed to upsert”: the resolver swallowed the database error. Replaying the insert inside a transaction I rolled back showed the real reason. An international phone number was one character longer than its column.",
        insight: "A catch block that returns null doesn't handle the error, it just hides it until later.",
        evidence: [
          { kind: "cmd", text: "node scripts/sync-company-codes.js --instance=<tenant> --dry-run   # passes" },
          { kind: "cmd", text: "node scripts/sync-company-codes.js --instance=<tenant>" },
          { kind: "out", text: "[error] <tenant>: failed to upsert local company" },
          { kind: "out", text: "# same insert, inside a transaction that is rolled back:" },
          { kind: "hl", text: "SequelizeDatabaseError: Data too long for column 'mobile' at row 1" },
          { kind: "out", text: "'+250 7xx xxx xxx' → 16 chars, column VARCHAR(15)" },
        ],
      },
      {
        at: 46,
        phase: "followup",
        title: "Widened the columns, then the tenant synced",
        body: "Phone columns went from 15 to 20 characters in both models, with backups of the originals. The ORM altered the live tables on restart, and the sync ran clean.",
        evidence: [
          { kind: "out", text: "ALTER TABLE `portal_companies` CHANGE `mobile` `mobile` VARCHAR(20);" },
          { kind: "out", text: "ALTER TABLE `portal_users` CHANGE `mobile` `mobile` VARCHAR(20);" },
          { kind: "hl", text: "[ok] <tenant> · company changed: true" },
        ],
      },
    ],
    lessons: [
      "A browser error is a symptom. Check the status code before changing config.",
      "Read every script before running it, and dry-run anything that writes.",
      "Silent catch blocks don't remove failures, they delay them.",
      "Back up every file you touch and leave a trail of exactly what changed.",
    ],
  },
];

export const getIncident = (slug: string) => incidents.find((incident) => incident.slug === slug);

export function formatIncidentDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** 0 → "T+0", 9 → "T+9m", 75 → "T+1h15m" */
export function formatOffset(minutes: number) {
  if (minutes === 0) return "T+0";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `T+${hours ? `${hours}h` : ""}${rest ? `${rest}m` : ""}`;
}
