/**
 * Shyla Enterprise - TradeIndia + IndiaMART enquiry auto-reply (Google Apps Script)
 * Chalta hai aapke Gmail (shyla.enterprz@gmail.com) me, free hai, alag server nahi chahiye.
 *
 * Kya karta hai (har 1 minute):
 *  1. TradeIndia ke naye enquiry emails padhta hai
 *  2. Naam / number / email / requirement nikalta hai
 *  3. Buyer ko turant email reply bhejta hai (agar buyer ka email mila)
 *  4. WhatsApp Cloud API se template message bhejta hai (agar token daala ho)
 *  5. Sheet me log karta hai, aur app ke liye JSON endpoint deta hai
 */
var CFG = {
  BRAND: 'Shyla Enterprise',
  PHONE: '9720583123',
  EMAIL: 'shyla.enterprz@gmail.com',
  GSTIN: '09ERTPD7563P1ZN',
  WEB: 'www.gangastone.com',
  // Gmail search: TradeIndia ke emails. Zarurat ho to badlo.
  // TradeIndia + IndiaMART ke enquiry emails. Sender alag dikhe to yahan badlo.
  QUERY: '(from:inquiry.paid@rfis.tradeindia.com OR from:indiamart.com OR from:indiamart.in) is:unread newer_than:2d',
  LABEL: 'shyla-done',
  AUTO_EMAIL: true,
  // WhatsApp Cloud API (optional). Meta Business me approved template chahiye.
  WA_TOKEN: '',          // permanent access token
  WA_PHONE_ID: '',       // WhatsApp phone number ID
  WA_TEMPLATE: '',       // approved template name, jisme 1 variable {{1}} = buyer ka naam
  WA_LANG: 'en',
  // App ke endpoint ko chhupane ke liye koi bhi lamba secret likho, app me wahi daalna
  SECRET: 'CHANGE-ME-long-random-text'
};

function sheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID'), ss;
  if (id) ss = SpreadsheetApp.openById(id);
  else {
    ss = SpreadsheetApp.create('Shyla Enquiries');
    props.setProperty('SHEET_ID', ss.getId());
    ss.getSheets()[0].appendRow(['id', 'at', 'person', 'company', 'phone', 'email', 'city', 'state', 'req', 'replied', 'src']);
  }
  return ss.getSheets()[0];
}

function lab_(b, keys) {
  var m = b.match(new RegExp('(?:^|\\n)\\s*(?:' + keys + ')\\s*[:\\-]\\s*([^\\n]+)', 'i'));
  return m ? m[1].trim() : '';
}

function parse_(body) {
  var b = String(body).replace(/\r/g, '').replace(/\s*\*?\s*\b(Sender Name|Product Details|Requirement Details|Company Name|Mobile|Country|Buyer Details|city|state)\b\s*([:\-])/gi, '\n$1$2');
  var ph = (b.replace(/9355059508/g, '').match(/(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/) || [''])[0].replace(/[^\d]/g, '');
  if (ph.length > 10) ph = ph.slice(-10);
  var ems = (b.match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) || []).filter(function (e) { return !/tradeindia|indiamart|noreply|no-reply|shyla|turbancorpn/i.test(e); });
  var req = lab_(b, 'product details|requirement|product|looking for|message|enquiry for|inquiry for|description|details|subject');
  var qty = lab_(b, 'quantity|qty|order quantity');
  if (qty && req.toLowerCase().indexOf(qty.toLowerCase()) < 0) req = (req ? req + ' - ' : '') + qty;
  return {
    phone: ph, email: ems[0] || '',
    person: lab_(b, 'sender name|name|buyer name|buyer|contact person|person|full name'),
    company: lab_(b, 'company|company name|organi[sz]ation|firm'),
    city: lab_(b, 'city|location'), state: lab_(b, 'state'), req: req
  };
}

function replyText_(r) {
  var who = r.person || r.company || 'Sir/Madam';
  var prod = r.req || 'charcoal';
  return 'Namaste ' + who + ',\n\n' + CFG.BRAND + ' me aapki enquiry (' + prod + ') ke liye dhanyavaad. ' +
    'Hum charcoal ke manufacturer/supplier hain. Aapko kitni quantity chahiye aur delivery kahan karni hai? ' +
    'Rate, spec aur sample turant bhej denge.\n\n--\n' + CFG.BRAND + '\nGSTIN: ' + CFG.GSTIN +
    '\nMobile/WhatsApp: +91 ' + CFG.PHONE + '\nEmail: ' + CFG.EMAIL + '\nWeb: ' + CFG.WEB;
}

function sendWa_(r) {
  if (!CFG.WA_TOKEN || !CFG.WA_PHONE_ID || !CFG.WA_TEMPLATE || !r.phone) return false;
  var res = UrlFetchApp.fetch('https://graph.facebook.com/v19.0/' + CFG.WA_PHONE_ID + '/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + CFG.WA_TOKEN },
    payload: JSON.stringify({
      messaging_product: 'whatsapp', to: '91' + r.phone, type: 'template',
      template: { name: CFG.WA_TEMPLATE, language: { code: CFG.WA_LANG },
        components: [{ type: 'body', parameters: [{ type: 'text', text: r.person || r.company || 'Sir' }] }] }
    })
  });
  return res.getResponseCode() < 300;
}

/** Time trigger isko har 1 minute chalata hai */
function processEnquiries() {
  var label = GmailApp.getUserLabelByName(CFG.LABEL) || GmailApp.createLabel(CFG.LABEL);
  var sh = sheet_();
  GmailApp.search(CFG.QUERY + ' -label:' + CFG.LABEL, 0, 20).forEach(function (th) {
    th.getMessages().forEach(function (m) {
      var r = parse_(m.getPlainBody());
      if (!r.phone && !r.email) return;
      var replied = false;
      try { if (CFG.AUTO_EMAIL && r.email) { GmailApp.sendEmail(r.email, 'Re: ' + (r.req || 'Enquiry') + ' - ' + CFG.BRAND, replyText_(r), { name: CFG.BRAND }); replied = true; } } catch (e) {}
      try { if (sendWa_(r)) replied = true; } catch (e) {}
      var src = /indiamart/i.test(m.getFrom()) ? 'IndiaMART' : 'TradeIndia';
      sh.appendRow([m.getId(), new Date().getTime(), r.person, r.company, r.phone, r.email, r.city, r.state, r.req, replied ? 'yes' : '', src]);
    });
    th.addLabel(label); th.markRead();
  });
}

/** App is URL se naye enquiry leti hai:  <web app url>?key=SECRET&since=<ms> */
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'restore') {
    if (e.parameter.key !== CFG.SECRET) return ContentService.createTextOutput('{}').setMimeType(ContentService.MimeType.JSON);
    var fi = DriveApp.getFoldersByName('Shyla Backups');
    if (fi.hasNext()) { var ff = fi.next().getFilesByName('shyla-latest.json'); if (ff.hasNext()) return ContentService.createTextOutput(ff.next().getBlob().getDataAsString()).setMimeType(ContentService.MimeType.JSON); }
    return ContentService.createTextOutput('{}').setMimeType(ContentService.MimeType.JSON);
  }
  if (!e || !e.parameter || e.parameter.key !== CFG.SECRET) return ContentService.createTextOutput('[]').setMimeType(ContentService.MimeType.JSON);
  var since = Number(e.parameter.since) || 0, out = [];
  sheet_().getDataRange().getValues().slice(1).forEach(function (x) {
    if (Number(x[1]) > since) out.push({ id: x[0], at: Number(x[1]), person: x[2], company: x[3], phone: x[4], email: x[5], city: x[6], state: x[7], req: x[8], replied: x[9] === 'yes', src: x[10] || '' });
  });
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/** Ek baar chalao: trigger bana deta hai */
function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('processEnquiries').timeBased().everyMinutes(1).create();
  sheet_();
}


/** Auto backup: app POST karti hai  <web app url>?key=SECRET&action=backup  (body = backup JSON).
 *  Drive me "Shyla Backups" folder banta hai: shyla-latest.json + roz ki dated file (last 14 rakhi jati hain). */
function doPost(e) {
  function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
  try {
    if (!e || !e.parameter || e.parameter.key !== CFG.SECRET) return out({ ok: false, error: 'key galat' });
    var body = e.postData && e.postData.contents;
    if (!body || body.length < 20) return out({ ok: false, error: 'khali data' });
    var it = DriveApp.getFoldersByName('Shyla Backups');
    var folder = it.hasNext() ? it.next() : DriveApp.createFolder('Shyla Backups');
    function put(name) {
      var f = folder.getFilesByName(name);
      if (f.hasNext()) f.next().setContent(body); else folder.createFile(name, body, 'application/json');
    }
    put('shyla-latest.json');
    put('shyla-' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd') + '.json');
    var dated = [], all = folder.getFiles();
    while (all.hasNext()) { var x = all.next(); if (/^shyla-\d{4}-\d{2}-\d{2}\.json$/.test(x.getName())) dated.push(x); }
    dated.sort(function (a, b) { return a.getName() < b.getName() ? 1 : -1; });
    dated.slice(14).forEach(function (x) { x.setTrashed(true); });
    return out({ ok: true, size: body.length });
  } catch (err) { return out({ ok: false, error: String(err) }); }
}
