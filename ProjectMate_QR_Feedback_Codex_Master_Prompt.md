# ProjectMate QR Feedback — Codex Master Implementation Prompt

You are Codex working inside the existing `QR-Feedback` repository.

## Goal

Turn the existing local ProjectMate feedback app into a production-ready public QR feedback system.

Final public flow:

QR → public HTTPS frontend → ProjectMate welcome → feedback form → thank-you → Express API → MongoDB Atlas.

Admin must remain separate and protected:

`/admin` → admin login → JWT → protected feedback/statistics APIs.

The QR must NEVER encode localhost, a private LAN IP, `/admin`, or the backend API URL.

---

## 1. First: audit the existing repository

Before changing anything:

1. Inspect the complete `backend` and `frontend` trees.
2. Inspect all `package.json` files.
3. Inspect `.env` and `.gitignore` files, but NEVER print secrets.
4. Search the entire repository for:
   - `localhost`
   - `127.0.0.1`
   - `10.`
   - `192.168.`
   - `:5000`
   - `:5173`
   - hardcoded API URLs
5. Inspect:
   - MongoDB connection
   - Feedback model
   - Feedback controller
   - Feedback routes
   - admin controller
   - admin routes
   - JWT middleware
   - frontend API service
   - App routing
   - public feedback components
   - admin pages
   - Vite config
6. Do not blindly overwrite working code.
7. Preserve the existing ProjectMate UI/UX and dark green visual identity unless a deployment/security change requires modification.
8. Run the existing app/tests/build before modifying anything and record the baseline.

---

## 2. Existing project context

### Frontend

React + Vite.

Installed/used:
- React
- Vite
- Framer Motion
- React Router
- ProjectMate logo asset

Known public components:
- `WelcomeScreen.jsx`
- `FeedbackForm.jsx`
- `ExperienceRating.jsx`
- `ThankYou.jsx`

Known pages:
- `FeedbackPage.jsx`
- `AdminLogin.jsx`
- `AdminDashboard.jsx`

Known asset:
- `frontend/src/assets/projectmate-logo.png`

### Backend

Node.js + Express + Mongoose.

Known files:
- `backend/index.js`
- `backend/config/db.js`
- `backend/controllers/feedbackController.js`
- `backend/controllers/adminController.js`
- `backend/models/Feedback.js`
- `backend/routes/feedbackRoutes.js`
- `backend/routes/adminRoutes.js`
- `backend/middleware/adminAuth.js`

Installed/used:
- express
- cors
- dotenv
- mongoose
- jsonwebtoken
- bcryptjs
- nodemon

### Existing public UX

The public feedback flow is already designed and working locally:

1. ProjectMate-branded welcome screen
2. automatic/interactive transition
3. compulsory name
4. creative experience rating:
   - 😞 Needs Work
   - 😕 Could Improve
   - 😐 Good
   - 😊 Very Good
   - 🤩 Outstanding
5. written feedback is OPTIONAL
6. review areas are OPTIONAL:
   - Presentation
   - Explanation
   - Project Idea
   - Innovation
   - Technical Knowledge
   - Design & UI
7. submit feedback
8. premium thank-you screen

### Existing admin

Admin login and JWT protection were implemented.

Public users do NOT need an account.

Admin access is separate at `/admin`.

---

## 3. Current local database

Current local MongoDB URI:

`mongodb://127.0.0.1:27017/qr_feedback`

Therefore current local database name is:

`qr_feedback`

Important:

The local `qr_feedback` database and Atlas `qr_feedback` database are different databases on different MongoDB deployments.

Do not assume data has already migrated.

Do not delete local MongoDB.

If old local feedback is needed, migrate/export it later.

If old data is not needed, Atlas can start empty and receive new feedback.

---

## 4. MongoDB Atlas state

Atlas setup has already been started manually.

Known state:
- Atlas organization/project exists
- `Cluster0` exists
- `Cluster0` is active
- cluster is free tier
- region is GCP/Mumbai (`asia-south1`)
- current public IP was added to Atlas IP Access List
- an Atlas SCRAM database user already exists
- Atlas Node.js driver connection string is available

Do NOT create another cluster.

### Important security gap

The existing Atlas user shown during setup has a broad `atlasAdmin@admin` / all-resources role.

Before final production:
- create a dedicated app user such as `qrfeedback_app`
- restrict it to the `qr_feedback` database with least privilege
- use that user in the backend
- do not use the broad Atlas admin account for the public production backend

---

## 5. Environment variables

### Backend

Required:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CORS_ORIGIN`

Backend must use:

`process.env.MONGO_URI`

and:

`process.env.PORT || 5000`

There must be no hardcoded MongoDB URI in production code.

The old `.env` had duplicate `JWT_SECRET` entries. Fix this so there is only ONE.

Credentials/secrets used during setup were exposed in chat earlier. Treat them as compromised and rotate:
- admin password
- JWT secret
- Atlas DB password if exposed

Never print secrets in logs.

### Frontend

Use:

`import.meta.env.VITE_API_URL`

for all API requests.

Development example:

`VITE_API_URL=http://localhost:5000/api`

Production example:

`VITE_API_URL=https://YOUR-BACKEND.onrender.com/api`

Never put:
- MongoDB URI
- DB password
- JWT secret
- admin password

into frontend environment variables.

Only Vite `VITE_*` variables are allowed in client code, and they must be considered public.

---

## 6. Fix MongoDB connection

### File

`backend/config/db.js`

Ensure it uses `process.env.MONGO_URI`.

Example:

```js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

Do not hardcode `mongodb://127.0.0.1:27017/...`.

---

## 7. Fix Express middleware order

`express.json()` MUST run before all API routes.

Correct conceptual order:

```js
app.use(cors(...));
app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
```

This is important because admin login previously failed when `req.body` was undefined.

---

## 8. CORS

Production CORS must allow only the real frontend origin.

Preferred:

```js
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
  })
);
```

Development:

`CORS_ORIGIN=http://localhost:5173`

Production:

`CORS_ORIGIN=https://YOUR-FRONTEND.vercel.app`

If multiple environments are needed, use a clean allowlist.

Do not leave `origin: "*"` in production.

---

## 9. Health endpoint

Add:

`GET /health`

Response:

```json
{
  "success": true,
  "message": "QR Feedback API is running"
}
```

This will be used by Render/monitoring.

---

## 10. Feedback API security

Public:
- `POST /api/feedback/create` (or the existing create route)

Protected:
- `GET /api/feedback`
- `GET /api/feedback/stats`

The exact route names should be preserved if already used by the frontend.

Public users should NEVER be able to read all feedback without admin authentication.

The QR only opens the frontend and never calls the feedback API directly.

---

## 11. Feedback validation

Server-side validation is mandatory.

Required:
- `name`
- `rating`

Optional:
- `feedback`
- `categories`

Suggested limits:
- name: 1–80 chars
- feedback: 0–1000 chars
- rating: integer 1–5
- categories: array of known category strings only

Trim strings.

Reject malformed or oversized requests.

Frontend validation alone is not sufficient.

---

## 12. Spam/rate limiting

Install `express-rate-limit`.

Apply a sensible rate limit to the public feedback creation endpoint.

Do not use a limit so low that one college/office Wi-Fi gets blocked for everyone.

Suggested starting point:
- about 20 submissions/IP/hour, then tune based on real use.

CAPTCHA is optional. Do not add CAPTCHA unless practical spam becomes a problem because the core requirement is a frictionless scan → feedback flow.

---

## 13. Security headers

Install/use `helmet`.

Example:

```js
const helmet = require("helmet");
app.use(helmet());
```

Test that it does not break the application.

---

## 14. Admin authentication

Preserve current JWT authentication.

Verify:
- admin login works
- JWT signature is verified
- expired/invalid tokens are rejected
- protected APIs require `Authorization: Bearer <token>`
- admin credentials come only from environment variables
- no admin password is hardcoded in React
- logout/invalid-token handling is implemented cleanly

If the current implementation stores the token in localStorage, keep it only if necessary for the existing app; document the tradeoff and ensure XSS exposure is minimized.

---

## 15. Frontend API cleanup

Centralize API base URL.

Prefer:

`frontend/src/services/api.js`

Use:

```js
const API_URL = import.meta.env.VITE_API_URL;
```

All public feedback and admin API calls must use it.

Search repository for hardcoded:
- `localhost`
- `127.0.0.1`
- `10.x.x.x`
- `192.168.x.x`
- `:5000`
- `:5173`

Remove production dependencies on local/private URLs.

---

## 16. Frontend env example

Create if useful:

`frontend/.env.example`

with:

```env
VITE_API_URL=http://localhost:5000/api
```

Do not commit production secrets.

---

## 17. Git security

Ensure `.gitignore` contains:

```gitignore
node_modules/
.env
.env.local
dist/
```

Before pushing to GitHub:
- no DB credentials
- no admin password
- no JWT secret
- no API secrets
- no private-IP URLs needed for production

If credentials were ever committed, rotate them.

---

## 18. Database migration strategy

Do not delete the current local database.

If old local feedback must be preserved:
- export local `qr_feedback`
- import into Atlas `qr_feedback`
- compare document counts
- verify sample records

If old data is not required:
- leave local DB untouched
- let Atlas start clean
- new production feedback goes only to Atlas

Do not assume same database name means same data.

---

## 19. Backend deployment

Preferred target:

Render Web Service.

Repository:
existing `QR-Feedback` repo.

Backend root:
`backend`

Build:
`npm install`

Start:
`node index.js`
or current production start script.

Render environment variables:
- `MONGO_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CORS_ORIGIN`

Use the production Atlas URI.

Do not hardcode port 5000.

After deployment, test:

`https://YOUR-BACKEND.onrender.com/health`

Then test the feedback API.

Do not claim deployment is successful unless the live endpoint is actually verified.

---

## 20. Frontend deployment

Preferred target:

Vercel.

Frontend root:
`frontend`

Build:
`npm run build`

Output:
`dist`

Environment variable:

`VITE_API_URL=https://YOUR-BACKEND.onrender.com/api`

Verify:
- public `/` works
- refresh works
- `/admin` works
- admin login works
- feedback submission reaches production backend

If SPA routing requires Vercel fallback configuration, add only what is required.

---

## 21. Final URL

The final QR must encode the public HTTPS frontend URL.

Example:

`https://projectmate-feedback.vercel.app/`

Better long-term option:

`https://feedback.projectmate.in/`

if a custom domain is available.

Never encode:
- localhost
- private LAN IP
- `/admin`
- API URL
- MongoDB URI

---

## 22. Static vs dynamic QR

For the first production version, use a STATIC QR.

Static QR directly encodes the public URL and is simple and free.

Dynamic QR is optional later if:
- destination must change without reprinting
- scan analytics are required

A stable custom-domain redirect is the best long-term approach for printed posters if the domain can remain permanent.

---

## 23. QR generation

Prefer generating the QR locally with the `qrcode` npm package.

If not installed:

```bash
npm install qrcode
```

Create:

`scripts/generate-qr.js`

Requirements:
1. accept URL from argument or environment variable
2. reject non-HTTPS production URLs
3. reject URLs containing `/admin`
4. generate high-resolution PNG
5. optionally generate SVG
6. output into `qr/`
7. do not depend permanently on an external QR image API

Example:

```bash
node scripts/generate-qr.js https://YOUR-PUBLIC-FRONTEND/
```

Outputs:

- `qr/projectmate-feedback-qr.png`
- `qr/projectmate-feedback-qr.svg`

The script should print the exact encoded URL.

---

## 24. QR visual/print requirements

Because this QR will be printed on a ProjectMate display:

- preserve strong contrast
- preserve a quiet zone
- do not overcrowd the QR with graphics
- ProjectMate logo may be placed above/below, or a small center logo may be used only with high error correction
- prefer SVG for print
- generate a high-resolution PNG too
- verify scanability before printing

Do not prioritize appearance over scan reliability.

---

## 25. Final end-to-end test

Test from at least:
- Android
- iPhone
- another browser
- another network, not only developer Wi-Fi

Final test:

```text
Phone
 ↓
Scan QR
 ↓
PUBLIC HTTPS FRONTEND
 ↓
Welcome
 ↓
Feedback
 ↓
Submit
 ↓
PUBLIC HTTPS BACKEND
 ↓
MongoDB Atlas
 ↓
document stored
```

Then separately:

```text
/admin
 ↓
Admin Login
 ↓
JWT
 ↓
Protected Dashboard
 ↓
Feedback / Stats
```

---

## 26. MongoDB Compass

After Atlas becomes production DB, Compass should connect to the Atlas SRV URI.

Expected:

```text
Cluster0
└── qr_feedback
    └── feedback collection
```

Compass is only a client/viewer. Atlas is the actual cloud production database.

---

## 27. Monitoring

Add:
- health endpoint
- Render logs
- Vercel logs/build history

Optional:
- UptimeRobot

Do not over-engineer monitoring before the basic production deployment works.

---

## 28. Backup/export

Provide at least one practical way to export feedback data.

An admin CSV export is a useful future feature.

Do not rely only on the UI for data safety.

---

## 29. Privacy

Current public collection:
- name
- rating
- optional written feedback
- optional review categories
- timestamp

Do not add unnecessary personal data.

If the app becomes widely/publicly used, add a small privacy notice.

---

## 30. UX requirements

Do not require public users to:
- register
- login
- verify email
- enter phone number

Core experience should stay:

Scan → choose rating → optionally write feedback → submit → done.

---

## 31. ProjectMate visual requirements

Preserve:
- actual ProjectMate logo
- dark theme
- green accent
- large branding
- premium welcome screen
- creative emoji rating
- large review cards
- premium thank-you screen

Do not replace the working public design with a generic form.

---

## 32. Deployment order

Execute in this exact order:

### Phase A — Audit
1. inspect repository
2. baseline build/run
3. locate all hardcoded local URLs
4. inspect env handling
5. inspect auth and API routes

### Phase B — Local production preparation
6. centralize API URL
7. clean env handling
8. fix CORS
9. add `/health`
10. protect feedback GET APIs
11. add server validation
12. add rate limiting
13. add Helmet
14. verify admin JWT
15. verify `npm run build`

### Phase C — Atlas
16. configure Atlas URI locally
17. test local backend against Atlas
18. submit feedback
19. verify in Atlas
20. optionally migrate old local data
21. verify Compass against Atlas
22. create least-privilege Atlas application user

### Phase D — GitHub
23. clean `.gitignore`
24. ensure secrets are absent
25. commit and push

### Phase E — Backend deployment
26. deploy Render backend
27. set production environment variables
28. test `/health`
29. test feedback POST
30. test protected GET APIs
31. verify Atlas data

### Phase F — Frontend deployment
32. deploy Vercel frontend
33. set `VITE_API_URL`
34. test public `/`
35. test `/admin`
36. test feedback submission

### Phase G — QR
37. determine final HTTPS frontend URL
38. test URL on multiple devices
39. generate PNG QR
40. generate SVG QR
41. verify QR target
42. scan printed test

### Phase H — Go live
43. rotate temporary credentials
44. confirm least-privilege DB user
45. confirm CORS
46. confirm rate limiting
47. confirm admin protection
48. confirm export/backup plan
49. provide final URLs
50. provide QR files

---

## 33. Final architecture

```text
                   PRINTED QR
                       │
                       ▼
             https://PUBLIC-FRONTEND/
                       │
                       ▼
                ┌──────────────┐
                │    VERCEL    │
                │ React / Vite │
                └──────┬───────┘
                       │
                   HTTPS API
                       │
                       ▼
                ┌──────────────┐
                │    RENDER    │
                │ Node/Express │
                └──────┬───────┘
                       │
                    Mongoose
                       │
                       ▼
                ┌──────────────┐
                │ MONGODB      │
                │ ATLAS        │
                │ qr_feedback  │
                └──────────────┘

Admin:
public-frontend/admin
        ↓
Admin Login
        ↓
JWT
        ↓
Protected Backend APIs
        ↓
MongoDB Atlas
```

---

## 34. Final reporting requirement

At the end, report:

1. files changed
2. packages added
3. environment variables required
4. local tests
5. Atlas connection status
6. database/collection status
7. backend URL
8. frontend URL
9. admin URL
10. final QR target URL
11. generated QR file paths
12. remaining manual dashboard steps
13. security warnings
14. exact next action if deployment cannot be completed automatically

Never claim a deployment, DB migration, QR scan, or production test succeeded unless it was actually verified.

---

## 35. Absolute final requirement

The final product must satisfy this statement:

> Any person with an internet-connected phone can scan the printed ProjectMate QR code, open the public feedback page without logging in, submit a review, and have that review stored in MongoDB Atlas. The admin area is separate and protected.

Start by auditing the real repository and execute the phases in order. Do not skip the audit.
