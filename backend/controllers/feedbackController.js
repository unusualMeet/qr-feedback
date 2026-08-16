const { pool } = require("../config/db");
const { allowedCategories, mapFeedbackRow } = require("../models/Feedback");

const validateFeedback = ({ name, rating, feedback, categories }) => {
  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedFeedback = typeof feedback === "string" ? feedback.trim() : "";
  const numericRating = Number(rating);

  if (!trimmedName || trimmedName.length > 80) {
    return { message: "Name is required and must be 80 characters or fewer" };
  }
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return { message: "Rating must be an integer from 1 to 5" };
  }
  if (trimmedFeedback.length > 1000) {
    return { message: "Feedback must be 1000 characters or fewer" };
  }
  if (!Array.isArray(categories) || categories.some((category) =>
    typeof category !== "string" || !allowedCategories.has(category)
  )) {
    return { message: "Categories contain an invalid value" };
  }

  return {
    value: {
      name: trimmedName,
      rating: numericRating,
      feedback: trimmedFeedback,
      categories: [...new Set(categories)],
    },
  };
};

const selectColumns = `id AS _id, name, rating, feedback, categories, source,
  created_at AS createdAt, updated_at AS updatedAt`;

const createFeedback = async (req, res) => {
  try {
    const { name, rating, feedback, categories = [] } = req.body || {};
    const validation = validateFeedback({ name, rating, feedback, categories });
    if (validation.message) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const { value } = validation;
    const [result] = await pool.execute(
      `INSERT INTO feedbacks (name, rating, feedback, categories, source)
       VALUES (?, ?, ?, ?, ?)`,
      [value.name, value.rating, value.feedback || null, JSON.stringify(value.categories), "QR"]
    );
    const [rows] = await pool.execute(
      `SELECT ${selectColumns} FROM feedbacks WHERE id = ?`, [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: mapFeedbackRow(rows[0]),
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getFeedback = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const offset = (page - 1) * limit;
    const [[countRows], [rows]] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM feedbacks"),
      pool.query(
        `SELECT ${selectColumns} FROM feedbacks
         ORDER BY created_at DESC LIMIT ? OFFSET ?`, [limit, offset]
      ),
    ]);
    const total = Number(countRows[0].total);

    return res.json({
      success: true,
      feedback: rows.map(mapFeedbackRow),
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error("Get feedback error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch feedback" });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, message: "Invalid feedback id" });
    }

    const [result] = await pool.execute("DELETE FROM feedbacks WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }
    return res.json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Delete feedback error:", error);
    return res.status(500).json({ success: false, message: "Unable to delete feedback" });
  }
};

const escapeCsv = (value) => {
  if (value === null || value === undefined) return '""';
  const text = String(value);
  return text.includes('"') || text.includes(",") || text.includes("\n")
    ? `"${text.replace(/"/g, '""')}"` : text;
};

const exportCSV = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${selectColumns} FROM feedbacks ORDER BY created_at DESC`
    );
    const csvRows = rows.map((row) => {
      const item = mapFeedbackRow(row);
      return [
        escapeCsv(item.name), escapeCsv(item.rating), escapeCsv(item.feedback || ""),
        escapeCsv(item.categories.join("; ")),
        escapeCsv(item.createdAt ? new Date(item.createdAt).toISOString() : ""),
      ].join(",");
    });
    const csv = "Name,Rating,Feedback,Categories,Date\n" + csvRows.join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=projectmate-feedback-${new Date().toISOString().slice(0, 10)}.csv`);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.status(200).send("\uFEFF" + csv);
  } catch (error) {
    console.error("Export CSV error:", error);
    return res.status(500).json({ success: false, message: "Unable to export feedback" });
  }
};

const getStats = async (req, res) => {
  try {
    const [[countRows], [ratingRows], [averageRows]] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM feedbacks"),
      pool.query(`SELECT rating AS _id, COUNT(*) AS count FROM feedbacks
                  GROUP BY rating ORDER BY rating ASC`),
      pool.query("SELECT COALESCE(AVG(rating), 0) AS average FROM feedbacks"),
    ]);
    return res.json({
      success: true,
      total: Number(countRows[0].total),
      average: Number(Number(averageRows[0].average).toFixed(1)),
      ratings: ratingRows.map((row) => ({ _id: row._id, count: Number(row.count) })),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch statistics" });
  }
};

module.exports = { createFeedback, getFeedback, deleteFeedback, exportCSV, getStats };
