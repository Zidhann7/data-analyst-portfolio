/**
 * Portfolio contact form -> nicely formatted HTML email in YOUR Gmail.
 * Runs inside your own Google account (no password needed anywhere).
 *
 * SETUP (once):
 * 1. Go to https://script.google.com  ->  New project  -> delete the sample code -> paste this whole file.
 * 2. Click Deploy -> New deployment -> gear icon -> "Web app".
 *      Execute as:      Me
 *      Who has access:  Anyone
 * 3. Click Deploy, then Authorize access (choose your Gmail; if Google says "unverified app",
 *    click Advanced -> Go to project (unsafe) -> Allow. It is your own script).
 * 4. Copy the Web app URL (it ends with /exec) and paste it into index.html:
 *      const contactConfig = { toEmail: "...", appsScriptUrl: "PASTE_URL_HERE" };
 * 5. If you ever edit this file, use Deploy -> Manage deployments -> Edit -> New version.
 */

const TO_EMAIL = "zidhann7@gmail.com";

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const name = clean_(d.name, 100);
    const email = clean_(d.email, 150);
    const subject = clean_(d.subject, 150);
    const message = clean_(d.message, 3000);

    if (!name || !email || !subject || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json_({ ok: false, error: "invalid" });
    }

    // basic spam guard: one message per sender every 30 seconds
    const cache = CacheService.getScriptCache();
    const key = "m_" + email.toLowerCase();
    if (cache.get(key)) return json_({ ok: false, error: "wait" });
    cache.put(key, "1", 30);

    const when = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm a") + " IST";
    const plain = "New message from your portfolio\n\nName: " + name + "\nEmail: " + email +
                  "\nSubject: " + subject + "\n\n" + message + "\n\nReceived: " + when;

    GmailApp.sendEmail(TO_EMAIL, "Portfolio message: " + subject, plain, {
      htmlBody: buildHtml_(name, email, subject, message, when),
      replyTo: email,
      name: "Portfolio Contact Form"
    });
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "server" });
  }
}

function doGet() {
  return json_({ ok: true, message: "Contact endpoint is running" });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function clean_(v, max) {
  return String(v == null ? "" : v).replace(/\r/g, "").trim().slice(0, max);
}

function esc_(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function buildHtml_(name, email, subject, message, when) {
  const n = esc_(name), em = esc_(email), sj = esc_(subject), when_ = esc_(when);
  const msg = esc_(message).replace(/\n/g, "<br>");
  const replyHref = "mailto:" + em + "?subject=" + encodeURIComponent("Re: " + subject);
  const initial = esc_(name.charAt(0).toUpperCase());
  return '' +
  '<div style="margin:0;padding:28px 12px;background:#F4F3FA;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;">' +
      '<tr><td style="background:linear-gradient(135deg,#4B54C9,#2939ff);background-color:#4B54C9;border-radius:22px 22px 0 0;padding:28px 32px;">' +
        '<div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#cfd3ff;font-weight:700;">Portfolio &middot; Let\'s Connect</div>' +
        '<div style="font-size:24px;line-height:1.3;color:#ffffff;font-weight:700;margin-top:8px;">You have a new message</div>' +
      '</td></tr>' +
      '<tr><td style="background:#ffffff;padding:28px 32px;border-left:1px solid #E4E5F4;border-right:1px solid #E4E5F4;">' +
        '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;"><tr>' +
          '<td style="width:52px;vertical-align:top;"><div style="width:46px;height:46px;border-radius:50%;background:#EEF0FF;color:#4B54C9;font-weight:700;font-size:20px;line-height:46px;text-align:center;">' + initial + '</div></td>' +
          '<td style="vertical-align:middle;"><div style="font-size:17px;font-weight:700;color:#141412;">' + n + '</div>' +
            '<a href="mailto:' + em + '" style="font-size:14px;color:#4B54C9;text-decoration:none;">' + em + '</a></td>' +
        '</tr></table>' +
        '<div style="height:1px;background:#ECECF6;margin:22px 0;"></div>' +
        '<div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a8aa0;font-weight:700;">Subject</div>' +
        '<div style="font-size:18px;color:#141412;font-weight:600;margin:6px 0 22px;">' + sj + '</div>' +
        '<div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a8aa0;font-weight:700;">Message</div>' +
        '<div style="font-size:15px;line-height:1.75;color:#2d2d33;background:#F8F8FD;border:1px solid #ECECF6;border-left:4px solid #4B54C9;border-radius:12px;padding:16px 18px;margin-top:8px;">' + msg + '</div>' +
        '<div style="margin-top:28px;"><a href="' + replyHref + '" style="display:inline-block;background:#4B54C9;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:999px;">Reply to ' + n + '</a></div>' +
      '</td></tr>' +
      '<tr><td style="background:#ffffff;border:1px solid #E4E5F4;border-top:0;border-radius:0 0 22px 22px;padding:16px 32px 22px;">' +
        '<div style="font-size:12px;color:#9a9aae;">Received ' + when_ + ' &middot; sent from your portfolio contact form</div>' +
      '</td></tr>' +
    '</table>' +
  '</div>';
}
