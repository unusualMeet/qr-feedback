const fs = require("node:fs");
const path = require("node:path");
const QRCode = require("qrcode");

const targetUrl = process.argv[2] || process.env.PUBLIC_FRONTEND_URL;

if (!targetUrl) {
  throw new Error("Provide a public HTTPS frontend URL as an argument or PUBLIC_FRONTEND_URL.");
}

let parsedUrl;
try {
  parsedUrl = new URL(targetUrl);
} catch {
  throw new Error("The QR target must be a valid URL.");
}

const isLocalTarget = parsedUrl.hostname === "localhost"
  || parsedUrl.hostname === "127.0.0.1"
  || /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(parsedUrl.hostname);

if (parsedUrl.protocol !== "https:" && !(parsedUrl.protocol === "http:" && isLocalTarget)) {
  throw new Error("Production QR targets must use HTTPS. HTTP is allowed only for local-network development URLs.");
}

if (parsedUrl.pathname.replace(/\/$/, "").endsWith("/admin") || parsedUrl.pathname.includes("/admin/")) {
  throw new Error("The QR target must not point to the admin area.");
}

const outputDirectory = path.resolve(__dirname, "..", "qr");
fs.mkdirSync(outputDirectory, { recursive: true });

const options = { errorCorrectionLevel: "H", margin: 4, width: 1600 };

Promise.all([
  QRCode.toFile(path.join(outputDirectory, "projectmate-feedback-qr.png"), targetUrl, options),
  QRCode.toFile(path.join(outputDirectory, "projectmate-feedback-qr.svg"), targetUrl, {
    ...options,
    type: "svg",
  }),
]).then(() => {
  console.log(`QR target: ${targetUrl}`);
  console.log("Created qr/projectmate-feedback-qr.png");
  console.log("Created qr/projectmate-feedback-qr.svg");
}).catch((error) => {
  console.error(`QR generation failed: ${error.message}`);
  process.exitCode = 1;
});
