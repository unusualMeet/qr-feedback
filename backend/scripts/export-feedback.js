const fs = require("node:fs/promises");
const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("../config/db");
const { pool } = require("../config/db");

async function exportFeedback() {
  await connectDB();
  const [records] = await pool.query(`
    SELECT id AS _id, name, rating, feedback, categories, source,
           created_at AS createdAt, updated_at AS updatedAt
    FROM feedbacks
    ORDER BY created_at DESC
  `);

  const outputDirectory = path.resolve(__dirname, "../../exports");
  await fs.mkdir(outputDirectory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputPath = path.join(outputDirectory, `feedback-${timestamp}.json`);
  await fs.writeFile(outputPath, JSON.stringify(records, null, 2), "utf8");
  console.log(`Exported ${records.length} feedback records to ${path.relative(process.cwd(), outputPath)}`);
  await pool.end();
}

exportFeedback().catch(async (error) => {
  console.error(`Feedback export failed: ${error.message}`);
  await pool.end().catch(() => {});
  process.exitCode = 1;
});
