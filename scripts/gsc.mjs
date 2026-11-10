#!/usr/bin/env node
/**
 * Google Search Console CLI for wypozycz.online.
 *
 * Auth (default): OAuth Desktop client "gsc-cli" in Google Cloud project wypozyczonline-514311.
 * The owner signs in once; the refresh token lives in .secrets/ (git-ignored).
 * Service account keys are blocked by the organization policy, so GSC_CREDENTIALS is only a fallback.
 *
 *   GSC_SITE_URL=sc-domain:wypozycz.online         (or https://wypozycz.online/ for a URL-prefix property)
 *
 * Usage:
 *   node scripts/gsc.mjs login [client_secret.json]  one-time sign-in (copies the client file into .secrets/)
 *   node scripts/gsc.mjs sites                       list properties the account can see
 *   node scripts/gsc.mjs report [days=28]            queries, pages, quick-win opportunities (+ JSON in scratch/gsc/)
 *   node scripts/gsc.mjs sitemaps                    list submitted sitemaps and their status
 *   node scripts/gsc.mjs submit-sitemap [url]        submit sitemap (default: <site>/sitemap.xml)
 *   node scripts/gsc.mjs inspect <url> [<url>...]    URL Inspection: index status, last crawl, canonical
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { searchconsole, auth } from '@googleapis/searchconsole';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'], quiet: true });

const SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:wypozycz.online';
// Not NEXT_PUBLIC_SITE_URL: .env.local points it at localhost for development.
const PUBLIC_URL = (process.env.GSC_PUBLIC_URL || 'https://wypozycz.online').replace(/\/$/, '');

const SCOPES = ['https://www.googleapis.com/auth/webmasters'];
const OAUTH_CLIENT_FILE = process.env.GSC_OAUTH_CLIENT || '.secrets/gsc-oauth-client.json';
const OAUTH_TOKEN_FILE = process.env.GSC_OAUTH_TOKEN || '.secrets/gsc-oauth-token.json';

function oauthClient() {
  const raw = JSON.parse(readFileSync(OAUTH_CLIENT_FILE, 'utf8'));
  const { client_id, client_secret } = raw.installed || raw.web || raw;
  return new auth.OAuth2(client_id, client_secret);
}

/** One-time browser sign-in with the owner's Google account; stores a refresh token in .secrets/. */
async function login(clientFile) {
  if (clientFile) {
    mkdirSync(dirname(OAUTH_CLIENT_FILE), { recursive: true });
    copyFileSync(clientFile, OAUTH_CLIENT_FILE);
    console.log(`Skopiowano klienta OAuth do ${OAUTH_CLIENT_FILE}`);
  }
  if (!existsSync(OAUTH_CLIENT_FILE)) throw new Error(`Brak ${OAUTH_CLIENT_FILE}. Podaj ścieżkę: npm run gsc -- login <client_secret.json>`);

  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const redirectUri = `http://127.0.0.1:${server.address().port}`;
  const oauth = oauthClient();
  const url = oauth.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: SCOPES, redirect_uri: redirectUri });

  console.log(`Otwórz w przeglądarce i zaloguj się kontem z dostępem do Search Console:\n\n${url}\n`);
  if (process.platform === 'win32') spawn('cmd', ['/c', 'start', '""', url.replace(/&/g, '^&')], { stdio: 'ignore', detached: true }).unref();

  const code = await new Promise((resolve, reject) => {
    server.on('request', (req, res) => {
      const params = new URL(req.url, redirectUri).searchParams;
      if (!params.has('code') && !params.has('error')) return res.end();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(params.get('code') ? '<h2>Zalogowano. Możesz zamknąć tę kartę.</h2>' : `<h2>Błąd: ${params.get('error')}</h2>`);
      server.close();
      params.get('code') ? resolve(params.get('code')) : reject(new Error(params.get('error')));
    });
  });

  const { tokens } = await oauth.getToken({ code, redirect_uri: redirectUri });
  if (!tokens.refresh_token) throw new Error('Google nie zwrócił refresh tokena. Usuń dostęp aplikacji na myaccount.google.com/permissions i spróbuj ponownie.');
  mkdirSync(dirname(OAUTH_TOKEN_FILE), { recursive: true });
  writeFileSync(OAUTH_TOKEN_FILE, JSON.stringify(tokens, null, 2));
  console.log(`Zapisano token w ${OAUTH_TOKEN_FILE}`);
}

function authClient() {
  if (existsSync(OAUTH_TOKEN_FILE) && existsSync(OAUTH_CLIENT_FILE)) {
    const oauth = oauthClient();
    oauth.setCredentials(JSON.parse(readFileSync(OAUTH_TOKEN_FILE, 'utf8')));
    return oauth;
  }
  // Fallback: service account key (blocked by the luqe010-org policy, kept for other setups).
  const credentials = process.env.GSC_CREDENTIALS_JSON
    ? JSON.parse(process.env.GSC_CREDENTIALS_JSON)
    : process.env.GSC_CREDENTIALS && existsSync(process.env.GSC_CREDENTIALS)
      ? JSON.parse(readFileSync(process.env.GSC_CREDENTIALS, 'utf8'))
      : null;
  if (!credentials) {
    console.error('Brak logowania. Uruchom: npm run gsc -- login <client_secret.json>');
    process.exit(1);
  }
  return new auth.GoogleAuth({ credentials, scopes: SCOPES });
}

function client() {
  return searchconsole({ version: 'v1', auth: authClient() });
}

const isoDate = (d) => d.toISOString().slice(0, 10);

function range(days) {
  // Search Console data lags ~2-3 days.
  const end = new Date(Date.now() - 3 * 86400000);
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

async function query(gsc, body) {
  const rows = [];
  for (let startRow = 0; ; startRow += 25000) {
    const { data } = await gsc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: { rowLimit: 25000, startRow, dataState: 'all', ...body },
    });
    rows.push(...(data.rows || []));
    if (!data.rows || data.rows.length < 25000) return rows;
  }
}

const fmt = (r) => ({
  clicks: r.clicks,
  impr: r.impressions,
  ctr: `${(r.ctr * 100).toFixed(1)}%`,
  pos: r.position.toFixed(1),
});

function printTable(title, rows, keyName, limit = 20) {
  console.log(`\n== ${title} ==`);
  if (!rows.length) return console.log('(brak danych)');
  console.table(rows.slice(0, limit).map((r) => ({ [keyName]: r.keys.join(' | ').replace(PUBLIC_URL, ''), ...fmt(r) })));
}

async function report(days = 28) {
  const gsc = client();
  const cur = range(days);
  const prevEnd = new Date(new Date(cur.startDate).getTime() - 86400000);
  const prev = { endDate: isoDate(prevEnd), startDate: isoDate(new Date(prevEnd.getTime() - (days - 1) * 86400000)) };

  const [totalsNow, totalsPrev, queries, pages, devices, daily, queryPage] = await Promise.all([
    query(gsc, { ...cur }),
    query(gsc, { ...prev }),
    query(gsc, { ...cur, dimensions: ['query'] }),
    query(gsc, { ...cur, dimensions: ['page'] }),
    query(gsc, { ...cur, dimensions: ['device'] }),
    query(gsc, { ...cur, dimensions: ['date'] }),
    query(gsc, { ...cur, dimensions: ['query', 'page'] }),
  ]);

  const t = (rows) => rows[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  console.log(`Właściwość: ${SITE_URL}`);
  console.log(`Okres: ${cur.startDate} – ${cur.endDate} (poprzedni: ${prev.startDate} – ${prev.endDate})`);
  console.table({ teraz: fmt(t(totalsNow)), poprzednio: fmt(t(totalsPrev)) });

  const byClicks = (a, b) => b.clicks - a.clicks || b.impressions - a.impressions;
  printTable('Top zapytania', [...queries].sort(byClicks), 'zapytanie');
  printTable('Top strony', [...pages].sort(byClicks), 'strona');
  printTable('Urządzenia', devices, 'urządzenie', 5);

  // Quick wins: already ranking on page 1-2 with impressions, but few clicks.
  const quickWins = queryPage
    .filter((r) => r.position >= 4 && r.position <= 20 && r.impressions >= 10)
    .sort((a, b) => b.impressions - a.impressions);
  printTable('Szybkie wygrane (poz. 4–20, ≥10 wyświetleń)', quickWins, 'zapytanie | strona', 30);

  const lowCtr = pages
    .filter((r) => r.impressions >= 50 && r.position <= 10 && r.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions);
  printTable('Niski CTR mimo top 10 (do poprawy title/description)', lowCtr, 'strona');

  mkdirSync('scratch/gsc', { recursive: true });
  const file = `scratch/gsc/report-${cur.endDate}-${days}d.json`;
  writeFileSync(file, JSON.stringify({ site: SITE_URL, cur, prev, totalsNow, totalsPrev, queries, pages, devices, daily, queryPage }, null, 2));
  console.log(`\nPełne dane: ${file}`);
}

async function main() {
  const [cmd = 'report', ...args] = process.argv.slice(2);

  if (cmd === 'login') {
    await login(args[0]);
  } else if (cmd === 'sites') {
    const { data } = await client().sites.list();
    console.table((data.siteEntry || []).map((s) => ({ site: s.siteUrl, permission: s.permissionLevel })));
    if (!data.siteEntry?.length) console.log('Konto nie ma dostępu do żadnej właściwości. Dodaj jego e-mail w Search Console → Ustawienia → Użytkownicy.');
  } else if (cmd === 'report') {
    await report(Number(args[0]) || 28);
  } else if (cmd === 'sitemaps') {
    const { data } = await client().sitemaps.list({ siteUrl: SITE_URL });
    console.table((data.sitemap || []).map((s) => ({
      path: s.path, lastSubmitted: s.lastSubmitted, lastDownloaded: s.lastDownloaded,
      pending: s.isPending, errors: s.errors, warnings: s.warnings,
      submitted: s.contents?.map((c) => `${c.type}:${c.submitted}`).join(' '),
    })));
  } else if (cmd === 'submit-sitemap') {
    const feedpath = args[0] || `${PUBLIC_URL}/sitemap.xml`;
    await client().sitemaps.submit({ siteUrl: SITE_URL, feedpath });
    console.log(`Wysłano: ${feedpath}`);
  } else if (cmd === 'inspect') {
    if (!args.length) throw new Error('Podaj co najmniej jeden URL.');
    const gsc = client();
    for (const raw of args) {
      const inspectionUrl = raw.startsWith('http') ? raw : `${PUBLIC_URL}${raw.startsWith('/') ? '' : '/'}${raw}`;
      const { data } = await gsc.urlInspection.index.inspect({ requestBody: { inspectionUrl, siteUrl: SITE_URL, languageCode: 'pl' } });
      const r = data.inspectionResult?.indexStatusResult || {};
      console.log(`\n${inspectionUrl}`);
      console.table({
        werdykt: r.verdict, stan: r.coverageState, indeksowanie: r.indexingState,
        ostatniCrawl: r.lastCrawlTime, canonicalGoogle: r.googleCanonical, canonicalStrony: r.userCanonical,
      });
    }
  } else {
    console.error(`Nieznane polecenie: ${cmd}`);
    process.exit(1);
  }
}

main().catch((err) => {
  const msg = err?.response?.data?.error?.message || err.message;
  console.error(`Błąd Search Console API: ${msg}`);
  if (/permission|403/i.test(msg)) console.error(`Sprawdź, czy konto serwisowe jest użytkownikiem właściwości ${SITE_URL} i czy GSC_SITE_URL jest poprawny (sc-domain:… albo https://…/).`);
  process.exit(1);
});
