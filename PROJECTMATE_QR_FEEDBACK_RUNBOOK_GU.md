# ProjectMate QR Feedback System — MySQL + phpMyAdmin Runbook

આ runbook ProjectMate QR Feedback System ને MongoDBના બદલે local MySQL અને phpMyAdmin સાથે ચલાવવા માટે છે.

> મહત્વપૂર્ણ: હાલના backend code માં Mongoose/MongoDB વપરાય છે. માત્ર phpMyAdminમાં database બનાવવાથી હાલનો code કામ નહીં કરે. MySQL માટે backend માં `mysql2` અને SQL queries ઉમેરવી પડશે. આ documentમાં database setup અને જરૂરી migration flow આપેલો છે.

## 1. System કેવી રીતે કામ કરશે

```text
QR Scan
  ↓
Public Frontend (React)
  ↓
Feedback Form
  ↓
Express Backend API
  ↓
MySQL Database (XAMPP)
  ↓
phpMyAdmin દ્વારા data manage
  ↓
Admin Dashboard
```

Public user માટે login, registration અથવા phone number જરૂરી નથી.

## 2. જરૂરી software

- Node.js અને npm
- XAMPP
- Visual Studio Code
- Git (વૈકલ્પિક)

XAMPPમાં `Apache` જરૂરી નથી જો તમે માત્ર Node/Express backend ચલાવતા હો. `MySQL` start કરવો જરૂરી છે. phpMyAdmin XAMPP સાથે આવે છે.

## 3. Repository ખોલવી

PowerShellમાં:

```powershell
cd D:\react_learn\QR-Feedback
```

## 4. phpMyAdminમાં database બનાવવો

1. XAMPP Control Panel ખોલો.
2. `MySQL`ની સામે **Start** દબાવો.
3. Browserમાં `http://localhost/phpmyadmin` ખોલો.
4. **Databases** tabમાં જાઓ.
5. Database name લખો:

```text
qr_feedback
```

6. Collation તરીકે `utf8mb4_general_ci` પસંદ કરો.
7. **Create** દબાવો.

`information_schema`, `mysql`, `performance_schema` અને `phpmyadmin` system databases છે. તેમાં project data બનાવશો નહીં.

## 5. Feedback table બનાવવી

phpMyAdminમાં ડાબી બાજુ `qr_feedback` પસંદ કરો, પછી **SQL** tab ખોલીને આ query ચલાવો:

```sql
CREATE TABLE feedbacks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  feedback TEXT NULL,
  categories JSON NULL,
  source VARCHAR(20) NOT NULL DEFAULT 'QR',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

`categories` માટે JSON array save થશે, ઉદાહરણ:

```json
["Service", "Cleanliness"]
```

Table બન્યું છે કે નહીં તે જોવા `qr_feedback` → `feedbacks` ખોલો.

## 6. MySQL credentials

XAMPPના default setupમાં સામાન્ય રીતે:

```text
Host: localhost
Port: 3306
User: root
Password: (ખાલી)
Database: qr_feedback
```

જો phpMyAdminમાં root password set કરેલો હોય તો તે password backend `.env`માં આપવો.

## 7. Backend `.env` તૈયાર કરવો

`backend/.env` file બનાવો અથવા update કરો:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=qr_feedback
JWT_SECRET=તમારો-લાંબો-random-secret
ADMIN_EMAIL=તમારું-admin-email
ADMIN_PASSWORD=તમારો-મજબૂત-admin-password
CORS_ORIGIN=http://localhost:5173
```

`.env` GitHub પર commit/upload કરશો નહીં.

## 8. Backend માં MongoDBથી MySQL migration

હાલના projectમાં આ files MongoDB પર આધારિત છે અને update કરવી પડશે:

- `backend/config/db.js`
- `backend/models/Feedback.js`
- `backend/controllers/feedbackController.js`
- `backend/controllers/adminController.js`
- `backend/scripts/export-feedback.js`
- `backend/package.json`

### 8.1 MongoDB package remove અને MySQL package install

```powershell
cd D:\react_learn\QR-Feedback\backend
npm.cmd uninstall mongoose
npm.cmd install mysql2
```

`package.json`માં `mongoose` ન રહેવું જોઈએ અને `mysql2` હોવું જોઈએ.

### 8.2 MySQL connection pool

`backend/config/db.js`નો basic connection આ પ્રકારનો રાખવો:

```js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "qr_feedback",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

const connectDatabase = async () => {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
  console.log("MySQL connected");
};

module.exports = { pool, connectDatabase };
```

### 8.3 Controller query mapping

Mongoose methodsની જગ્યાએ SQL queries વાપરવાની રહેશે:

```js
const { pool } = require("../config/db");

// Create
await pool.execute(
  "INSERT INTO feedbacks (name, rating, feedback, categories) VALUES (?, ?, ?, ?)",
  [name, rating, feedback || null, JSON.stringify(categories || [])]
);

// Read latest feedback
const [rows] = await pool.query(
  "SELECT * FROM feedbacks ORDER BY created_at DESC"
);

// Delete
await pool.execute("DELETE FROM feedbacks WHERE id = ?", [id]);
```

Admin stats માટે `COUNT`, `AVG` અને `GROUP BY rating` queries વાપરવી. Frontend API responseનું shape શક્ય તેટલું હાલના MongoDB response જેવું જ રાખશો, જેથી React frontendમાં ઓછા ફેરફાર થાય.

## 9. Dependencies install

Backend:

```powershell
cd D:\react_learn\QR-Feedback\backend
npm.cmd install
```

Frontend:

```powershell
cd D:\react_learn\QR-Feedback\frontend
npm.cmd install
```

## 10. Local app run

### Terminal 1 — Backend

```powershell
cd D:\react_learn\QR-Feedback\backend
npm.cmd run dev
```

Health check:

```text
http://localhost:5000/health
```

Expected response:

```json
{
  "success": true,
  "message": "QR Feedback API is running"
}
```

### Terminal 2 — Frontend

```powershell
cd D:\react_learn\QR-Feedback\frontend
npm.cmd run dev
```

Browserમાં ખોલો:

- Public page: `http://localhost:5173`
- Admin page: `http://localhost:5173/admin`

## 11. Local feedback test

1. `http://localhost:5173` ખોલો.
2. Feedback formમાં name, rating, feedback અને categories भरो.
3. Submit કરો.
4. phpMyAdminમાં `qr_feedback` → `feedbacks` → **Browse** ખોલો.
5. નવો feedback row દેખાય છે કે નહીં તે ચેક કરો.
6. Admin dashboardમાં એ જ feedback દેખાય છે કે નહીં તે ચેક કરો.

જો row save ન થાય તો backend terminalમાં error જુઓ અને આ બાબતો તપાસો:

- XAMPPમાં MySQL running છે કે નહીં
- `.env`માં database name અને password સાચાં છે કે નહીં
- `feedbacks` tableનું નામ સાચું છે કે નહીં
- backendમાં હજુ Mongoose query રહી નથી ને

## 12. Admin dashboard

Admin URL:

```text
http://localhost:5173/admin
```

Admin login પછી dashboardમાં આ માહિતી દેખાવવી જોઈએ:

- Total responses
- Average rating
- Rating distribution
- Categories
- Search અને filters
- Recent reviews
- Delete feedback
- CSV export

Admin password frontend codeમાં રાખવો નહીં; તે માત્ર backend `.env`માં રાખવો.

## 13. Feedback backup / export

MySQL database backup માટે phpMyAdminમાં:

1. `qr_feedback` database પસંદ કરો.
2. **Export** tab ખોલો.
3. `Quick` અને `SQL` format પસંદ કરો.
4. **Export** દબાવો.

આથી `.sql` backup file મળશે. તેને સુરક્ષિત જગ્યાએ રાખો અને GitHub પર upload કરશો નહીં.

Backend JSON/CSV export feature હોય તો તે પણ ચલાવી શકો:

```powershell
cd D:\react_learn\QR-Feedback\backend
npm.cmd run export:feedback
```

> આ script હજુ MongoDB માટે લખાયેલી હોય તો તેને `SELECT * FROM feedbacks` query પ્રમાણે MySQL માટે update કરવી પડશે.

## 14. Production deployment

Local XAMPP MySQL માત્ર development માટે છે. Vercel/Render પર deploy કરેલા app માટે `localhost` database accessible નહીં હોય.

Production માટે બે practical options છે:

1. Managed MySQL provider — PlanetScale, Railway, Render અથવા Aiven.
2. Same server પર MySQL — server administration જરૂરી રહેશે.

Production backend environmentમાં આ variables આપો:

```env
DB_HOST=production-mysql-host
DB_PORT=3306
DB_USER=production-user
DB_PASSWORD=production-password
DB_NAME=qr_feedback
JWT_SECRET=long-production-secret
ADMIN_EMAIL=production-admin-email
ADMIN_PASSWORD=strong-production-password
CORS_ORIGIN=https://YOUR-FRONTEND.vercel.app
```

Productionમાં `DB_HOST=localhost` ત્યારે જ રાખવું જ્યારે backend અને MySQL એક જ server પર ચાલે.

## 15. QR URL

QRમાં માત્ર public frontend URL હોવો જોઈએ:

```text
https://YOUR-FRONTEND.vercel.app/
```

QRમાં આ વસ્તુઓ ન મૂકવી:

- `localhost`
- private IP
- `/admin`
- backend API URL
- database credentials

QR generate કરવા:

```powershell
cd D:\react_learn\QR-Feedback
npm.cmd run generate:qr -- https://YOUR-FRONTEND.vercel.app/
```

## 16. Final phone test

```text
Phone
  → Scan QR
  → Public HTTPS frontend
  → Feedback submit
  → Public HTTPS backend
  → MySQL feedbacks table
  → Admin dashboard
```

Android, iPhone અને અલગ mobile network પરથી test કરો.

## 17. Security checklist

- [ ] `.env` GitHubમાં નથી
- [ ] Productionમાં root MySQL user વપરાતો નથી
- [ ] Production database password strong છે
- [ ] JWT secret strong અને private છે
- [ ] CORSમાં માત્ર actual frontend origin છે
- [ ] Public feedback APIમાં validation છે
- [ ] Rate limiting enabled છે
- [ ] Helmet enabled છે
- [ ] Admin APIs protected છે
- [ ] Database backup regularly લેવામાં આવે છે
- [ ] QRમાં માત્ર public frontend URL છે

## 18. Current project status

આ runbook MySQL + phpMyAdmin માટે update થયેલું છે. પરંતુ હાલના source codeમાં Mongoose/MongoDB references છે. તેથી actual MySQL run શરૂ કરવા પહેલાં backend migrationના આ કામ પૂર્ણ કરવાં જરૂરી છે:

- [ ] `mysql2` install કરવું
- [ ] `config/db.js`માં MySQL pool બનાવવો
- [ ] Feedback model અને controllersને SQL queriesમાં બદલવા
- [ ] Admin stats અને delete queries બદલવી
- [ ] Export script બદલવી
- [ ] `.env`માં `DB_*` variables ઉમેરવા
- [ ] phpMyAdminમાં `qr_feedback.feedbacks` table બનાવવી
- [ ] Local feedback submit અને admin dashboard test કરવું
