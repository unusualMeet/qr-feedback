const allowedCategories = new Set([
  "Presentation",
  "Explanation",
  "Project Idea",
  "Innovation",
  "Technical Knowledge",
  "Design & UI",
]);

const parseCategories = (categories) => {
  if (Array.isArray(categories)) return categories;
  if (typeof categories !== "string" || !categories) return [];

  try {
    const parsed = JSON.parse(categories);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Keeps the SQL row shape compatible with the existing React dashboard.
const mapFeedbackRow = (row) => ({
  ...row,
  _id: String(row.id ?? row._id),
  categories: parseCategories(row.categories),
  createdAt: row.createdAt || row.created_at,
  updatedAt: row.updatedAt || row.updated_at,
});

module.exports = { allowedCategories, mapFeedbackRow };
