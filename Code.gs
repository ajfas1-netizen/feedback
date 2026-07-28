/**
 * Operate Bigger — Train the Intern feedback backend
 * Google Apps Script bound to the responses Google Sheet.
 *
 * WHAT IT DOES
 *   doPost  -> appends one feedback submission as a row
 *   doGet   -> returns live aggregates + shareable quotes as JSON (for results.html)
 *
 * SETUP (5 minutes, steps in README.md)
 *   1. Make a Google Sheet. Extensions > Apps Script. Paste this file.
 *   2. Run setupHeaders() once (authorize when prompted).
 *   3. Deploy > New deployment > Web app.
 *        Execute as: Me.   Who has access: Anyone.
 *   4. Copy the /exec Web App URL into WEB_APP_URL in feedback.html AND results.html.
 */

var SHEET_NAME = 'Responses';

var HEADERS = [
  'Timestamp','SkillBefore','SkillAfter','ValueToday','Recommend',
  'MostValuable','CanDo','FirstTask','Surprised','Better',
  'Quote','QuotePermission','Name','Role','HelpNext','Email'
];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

/** Run once from the editor to create the header row. */
function setupHeaders() {
  var sh = sheet_();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sh.setFrozenRows(1);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * True when a submission carries no content at all.
 * QuotePermission is deliberately excluded: picking a sharing option and
 * nothing else is still an empty form.
 */
var CONTENT_FIELDS = [
  'skillBefore','skillAfter','valueToday','recommend',
  'mostValuable','canDo','firstTask','surprised','better',
  'quote','name','role','helpNext','email'
];

function isBlank_(p) {
  for (var i = 0; i < CONTENT_FIELDS.length; i++) {
    if (String(p[CONTENT_FIELDS[i]] || '').trim() !== '') return false;
  }
  return true;
}

/** WRITE: append a submission. */
function doPost(e) {
  // The whole room submits inside the same few seconds. Serialize the appends
  // so two phones cannot land on the same row.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return json_({ ok: false, error: 'Server busy, please tap send again.' });
  }

  try {
    var p = JSON.parse(e.postData.contents);
    if (isBlank_(p)) {
      return json_({ ok: false, error: 'Empty submission, nothing was saved.' });
    }
    var sh = sheet_();
    sh.appendRow([
      new Date(),
      p.skillBefore || '', p.skillAfter || '', p.valueToday || '', p.recommend || '',
      p.mostValuable || '', p.canDo || '', p.firstTask || '', p.surprised || '', p.better || '',
      p.quote || '', p.quotePermission || '', p.name || '', p.role || '', p.helpNext || '', p.email || ''
    ]);
    // Commit before reading the row count back, so the number the participant
    // sees on the success screen is the real one.
    SpreadsheetApp.flush();
    return json_({ ok: true, count: sh.getLastRow() - 1 });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** READ: aggregates for the live dashboard. */
function doGet(e) {
  var sh = sheet_();
  var last = sh.getLastRow();
  if (last < 2) {
    return json_({ count: 0, avgBefore: 0, avgAfter: 0, avgValue: 0,
      avgRecommend: 0, confidencePct: 0, parts: {}, quotes: [] });
  }
  var rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var col = {}; HEADERS.forEach(function (h, i) { col[h] = i; });

  var n = rows.length;
  var sB = 0, cB = 0, sA = 0, cA = 0, sV = 0, cV = 0, sR = 0, cR = 0;
  var confYes = 0;
  var parts = {};
  var quotes = [];

  var CONF_MARK = 'Set up an AI assistant that knows me and my work';

  rows.forEach(function (r) {
    var b = num_(r[col.SkillBefore]); if (b !== null) { sB += b; cB++; }
    var a = num_(r[col.SkillAfter]);  if (a !== null) { sA += a; cA++; }
    var v = num_(r[col.ValueToday]);  if (v !== null) { sV += v; cV++; }
    var rc = num_(r[col.Recommend]);  if (rc !== null) { sR += rc; cR++; }

    var mv = String(r[col.MostValuable] || '');
    mv.split(',').forEach(function (part) {
      var t = part.trim(); if (!t) return;
      parts[t] = (parts[t] || 0) + 1;
    });

    if (String(r[col.CanDo] || '').indexOf(CONF_MARK) > -1) confYes++;

    var perm = String(r[col.QuotePermission] || '');
    var text = String(r[col.Quote] || '').trim();
    if (text && (perm === 'named' || perm === 'anon')) {
      quotes.push({
        text: text,
        name: perm === 'named' ? String(r[col.Name] || '').trim() : '',
        role: perm === 'named' ? String(r[col.Role] || '').trim() : ''
      });
    }
  });

  return json_({
    count: n,
    avgBefore: cB ? sB / cB : 0,
    avgAfter: cA ? sA / cA : 0,
    avgValue: cV ? sV / cV : 0,
    avgRecommend: cR ? sR / cR : 0,
    confidencePct: Math.round((confYes / n) * 100),
    parts: parts,
    quotes: quotes
  });
}

function num_(x) {
  if (x === '' || x === null || x === undefined) return null;
  var v = parseFloat(x);
  return isNaN(v) ? null : v;
}
