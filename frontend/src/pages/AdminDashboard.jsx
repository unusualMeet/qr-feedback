import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import logo from "../assets/projectmate-logo.png";
import {
  fetchAdminFeedback,
  fetchAdminStats,
  deleteFeedback,
  exportFeedbackCSV,
} from "../services/api";
import { toast } from "../components/Toast";
import {
  AdminStatCardSkeleton,
  AdminTableSkeleton,
  Skeleton,
} from "../components/Skeleton";

const ratingInfo = {
  1: { emoji: "😞", label: "Needs Work" },
  2: { emoji: "😕", label: "Could Improve" },
  3: { emoji: "😐", label: "Good" },
  4: { emoji: "😊", label: "Very Good" },
  5: { emoji: "🤩", label: "Outstanding" },
};

const categoryNames = [
  "Presentation",
  "Explanation",
  "Project Idea",
  "Innovation",
  "Technical Knowledge",
  "Design & UI",
];

function AdminDashboard({ onLogout }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDashboardData = useCallback(async (pageToFetch = 1) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("projectmate_admin_token");

      const [{ response: feedbackResponse, data: feedbackData }, { response: statsResponse, data: statsData }] =
        await Promise.all([
          fetchAdminFeedback(token, { page: pageToFetch, limit: 10 }),
          fetchAdminStats(token),
        ]);

      if (!feedbackResponse.ok || !statsResponse.ok) {
        throw new Error("Unable to fetch dashboard data");
      }

      setFeedback(feedbackData.feedback || []);
      setTotal(feedbackData.total || 0);
      setPage(feedbackData.page || pageToFetch);
      setPages(feedbackData.pages || 1);
      setStats(statsData);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load feedback data. Make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => fetchDashboardData(1), 0);
    return () => window.clearTimeout(timer);
  }, [fetchDashboardData]);

  const handleRefresh = useCallback(() => {
    fetchDashboardData(page);
  }, [fetchDashboardData, page]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      const token = localStorage.getItem("projectmate_admin_token");
      const { response } = await deleteFeedback(token, deleteTarget._id);

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      setFeedback((previous) => previous.filter((item) => item._id !== deleteTarget._id));
      setTotal((previous) => previous - 1);
      setDeleteTarget(null);

      toast.success("Feedback deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Unable to delete feedback.");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const handleExport = useCallback(async () => {
    try {
      const token = localStorage.getItem("projectmate_admin_token");
      const { response } = await exportFeedbackCSV(token);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `projectmate-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV exported successfully");
    } catch (err) {
      console.error(err);
      toast.error("Unable to export CSV.");
    }
  }, []);

  /* -----------------------------------------
     FILTER FEEDBACK
  ----------------------------------------- */

  const filteredFeedback = useMemo(() => {
    return feedback.filter((item) => {
      const name = item.name?.toLowerCase() || "";

      const message = item.feedback?.toLowerCase() || "";

      const matchesSearch =
        !search ||
        name.includes(search.toLowerCase()) ||
        message.includes(search.toLowerCase());

      const matchesRating =
        ratingFilter === "all" || Number(item.rating) === Number(ratingFilter);

      const itemCategories = item.categories || [];

      const matchesCategory =
        categoryFilter === "all" || itemCategories.includes(categoryFilter);

      return matchesSearch && matchesRating && matchesCategory;
    });
  }, [feedback, search, ratingFilter, categoryFilter]);

  /* -----------------------------------------
     CALCULATIONS
  ----------------------------------------- */

  const totalReviews = total;

  const averageRating = useMemo(() => {
    if (!stats) return "0.0";

    return Number(stats.average || 0).toFixed(1);
  }, [stats]);

  const positivePercentage = useMemo(() => {
    if (!stats || !stats.total) return 0;

    const positive = (stats.ratings || [])
      .filter((item) => Number(item._id) >= 4)
      .reduce((sum, item) => sum + item.count, 0);

    return Math.round((positive / stats.total) * 100);
  }, [stats]);

  const ratingCounts = useMemo(() => {
    const counts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    (stats?.ratings || []).forEach((item) => {
      const rating = Number(item._id);
      if (counts[rating] !== undefined) {
        counts[rating] = item.count;
      }
    });

    return counts;
  }, [stats]);

  const categoryCounts = useMemo(() => {
    const counts = {};

    categoryNames.forEach((category) => {
      counts[category] = 0;
    });

    feedback.forEach((item) => {
      (item.categories || []).forEach((category) => {
        if (counts[category] !== undefined) {
          counts[category]++;
        }
      });
    });

    return counts;
  }, [feedback]);

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);
  const maxRatingCount = Math.max(...Object.values(ratingCounts), 1);

  /* -----------------------------------------
     DATE
  ----------------------------------------- */

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* -----------------------------------------
     LOADING
  ----------------------------------------- */

  if (loading && feedback.length === 0) {
    return (
      <div className="admin-dashboard">
        <div className="admin-grid-background"></div>

        <header className="admin-header">
          <div className="admin-brand">
            <img src={logo} alt="ProjectMate" />

            <div className="admin-brand-divider"></div>

            <div>
              <span>ADMIN</span>
              <strong>FEEDBACK ANALYTICS</strong>
            </div>
          </div>

          <div className="admin-status">
            <span></span>
            LIVE DATA
          </div>
        </header>

        <main className="admin-content">
          <section className="admin-title">
            <div>
              <p className="admin-eyebrow">PROJECTMATE / INSIGHTS</p>

              <h1>
                Feedback
                <span> Overview.</span>
              </h1>

              <p className="admin-subtitle">
                Understand what people think about your project and where you can
                improve.
              </p>
            </div>

            <button className="refresh-button" onClick={handleRefresh} disabled>
              ↻<span>Refresh</span>
            </button>
          </section>

          <section className="admin-stat-grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <AdminStatCardSkeleton key={index} />
            ))}
          </section>

          <section className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-header">
                <div>
                  <span>01</span>
                  <h2>Experience</h2>
                </div>

                <p>Rating distribution</p>
              </div>

              <div className="rating-bars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div className="rating-bar-row" key={index}>
                    <div className="rating-label">
                      <Skeleton className="skeleton-emoji" />

                      <Skeleton className="skeleton-bar-label" />
                    </div>

                    <Skeleton className="skeleton-bar-track" />

                    <Skeleton className="skeleton-bar-count" />
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-card">
              <div className="analytics-header">
                <div>
                  <span>02</span>
                  <h2>Review Areas</h2>
                </div>

                <p>What people noticed</p>
              </div>

              <div className="category-bars">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div className="category-bar-row" key={index}>
                    <div>
                      <Skeleton className="skeleton-category-name" />

                      <Skeleton className="skeleton-category-count" />
                    </div>

                    <Skeleton className="skeleton-category-track" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="feedback-section">
            <div className="feedback-section-header">
              <div>
                <p>03 / RESPONSES</p>

                <h2>Recent Feedback</h2>
              </div>

              <span>Loading...</span>
            </div>

            <AdminTableSkeleton />
          </section>
        </main>
      </div>
    );
  }

  /* -----------------------------------------
     ERROR
  ----------------------------------------- */

  if (error && feedback.length === 0) {
    return (
      <div className="admin-dashboard">
        <div className="admin-grid-background"></div>

        <header className="admin-header">
          <div className="admin-brand">
            <img src={logo} alt="ProjectMate" />

            <div className="admin-brand-divider"></div>

            <div>
              <span>ADMIN</span>
              <strong>FEEDBACK ANALYTICS</strong>
            </div>
          </div>

          <div className="admin-status">
            <span></span>
            LIVE DATA
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-loading">
            <div className="admin-error-icon">!</div>

            <h2>Something went wrong</h2>

            <p>{error}</p>

            <button className="admin-retry" onClick={handleRefresh}>
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-grid-background"></div>

      {/* -----------------------------------
          TOP BAR
      ----------------------------------- */}

      <header className="admin-header">
        <div className="admin-brand">
          <img src={logo} alt="ProjectMate" />

          <div className="admin-brand-divider"></div>

          <div>
            <span>ADMIN</span>
            <strong>FEEDBACK ANALYTICS</strong>
          </div>
        </div>

        <div className="admin-actions">
          <button className="admin-action-button" onClick={handleExport}>
            ↓ Export CSV
          </button>

          <button className="admin-logout-button" onClick={onLogout}>
            Logout
          </button>

          <div className="admin-status">
            <span></span>
            LIVE DATA
          </div>
        </div>
      </header>

      <main className="admin-content">
        {/* -----------------------------------
            PAGE TITLE
        ----------------------------------- */}

        <section className="admin-title">
          <div>
            <p className="admin-eyebrow">PROJECTMATE / INSIGHTS</p>

            <h1>
              Feedback
              <span> Overview.</span>
            </h1>

            <p className="admin-subtitle">
              Understand what people think about your project and where you can
              improve.
            </p>
          </div>

          <button className="refresh-button" onClick={handleRefresh}>
            ↻<span>Refresh</span>
          </button>
        </section>

        {/* -----------------------------------
            STAT CARDS
        ----------------------------------- */}

        <section className="admin-stat-grid">
          <motion.div className="admin-stat-card" whileHover={{ y: -3 }}>
            <span className="stat-label">TOTAL RESPONSES</span>

            <strong>{totalReviews}</strong>

            <small>All collected feedback</small>
          </motion.div>

          <motion.div className="admin-stat-card" whileHover={{ y: -3 }}>
            <span className="stat-label">AVERAGE EXPERIENCE</span>

            <strong>
              {averageRating}
              <small className="rating-small">/ 5</small>
            </strong>

            <small>Overall satisfaction</small>
          </motion.div>

          <motion.div className="admin-stat-card" whileHover={{ y: -3 }}>
            <span className="stat-label">POSITIVE RESPONSES</span>

            <strong>{positivePercentage}%</strong>

            <small>4 or 5 experience rating</small>
          </motion.div>

          <motion.div
            className="admin-stat-card accent-stat"
            whileHover={{ y: -3 }}
          >
            <span className="stat-label">MOST SELECTED</span>

            <strong>
              {categoryNames.reduce(
                (best, category) =>
                  categoryCounts[category] > categoryCounts[best]
                    ? category
                    : best,
                categoryNames[0],
              )}
            </strong>

            <small>Most reviewed area</small>
          </motion.div>
        </section>

        {/* -----------------------------------
            ANALYTICS
        ----------------------------------- */}

        <section className="analytics-grid">
          {/* RATINGS */}

          <div className="analytics-card">
            <div className="analytics-header">
              <div>
                <span>01</span>
                <h2>Experience</h2>
              </div>

              <p>Rating distribution</p>
            </div>

            <div className="rating-bars">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingCounts[rating];

                const percentage = Math.round((count / maxRatingCount) * 100);

                return (
                  <div className="rating-bar-row" key={rating}>
                    <div className="rating-label">
                      <span>{ratingInfo[rating].emoji}</span>

                      <small>{ratingInfo[rating].label}</small>
                    </div>

                    <div className="rating-track">
                      <div
                        className="rating-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      ></div>
                    </div>

                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CATEGORIES */}

          <div className="analytics-card">
            <div className="analytics-header">
              <div>
                <span>02</span>
                <h2>Review Areas</h2>
              </div>

              <p>What people noticed</p>
            </div>

            <div className="category-bars">
              {categoryNames.map((category) => {
                const count = categoryCounts[category];

                const percentage = Math.round((count / maxCategoryCount) * 100);

                return (
                  <div className="category-bar-row" key={category}>
                    <div>
                      <span>{category}</span>

                      <strong>{count}</strong>
                    </div>

                    <div className="category-track">
                      <div
                        style={{
                          width: `${percentage}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* -----------------------------------
            FEEDBACK TABLE
        ----------------------------------- */}

        <section className="feedback-section">
          <div className="feedback-section-header">
            <div>
              <p>03 / RESPONSES</p>

              <h2>Recent Feedback</h2>
            </div>

            <span>{filteredFeedback.length} results</span>
          </div>

          {/* FILTERS */}

          <div className="feedback-filters">
            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search by name or feedback..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
            >
              <option value="all">All Ratings</option>

              <option value="5">🤩 5 — Outstanding</option>

              <option value="4">😊 4 — Very Good</option>

              <option value="3">😐 3 — Good</option>

              <option value="2">😕 2 — Could Improve</option>

              <option value="1">😞 1 — Needs Work</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All Areas</option>

              {categoryNames.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* FEEDBACK */}

          <div className="feedback-list">
            {filteredFeedback.length === 0 ? (
              <div className="empty-feedback">
                <span>◌</span>

                <h3>No feedback found</h3>

                <p>Try changing your filters or search query.</p>
              </div>
            ) : (
              filteredFeedback.map((item, index) => (
                <motion.article
                  className="feedback-item"
                  key={item._id || index}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.03,
                  }}
                >
                  <div className="feedback-person">
                    <div className="avatar">
                      {item.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    <div>
                      <h3>{item.name || "Anonymous"}</h3>

                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="feedback-main">
                    <div className="feedback-rating">
                      <span>{ratingInfo[Number(item.rating)]?.emoji}</span>

                      <strong>{item.rating}/5</strong>
                    </div>

                    {item.feedback ? (
                      <p className="feedback-message">"{item.feedback}"</p>
                    ) : (
                      <p className="no-written-feedback">
                        No written feedback provided.
                      </p>
                    )}

                    <div className="feedback-categories">
                      {(item.categories || []).map((category) => (
                        <span key={category}>{category}</span>
                      ))}
                    </div>

                    <div className="feedback-item-actions">
                      <button
                        type="button"
                        className="feedback-delete-button"
                        onClick={() => setDeleteTarget(item)}
                        aria-label={`Delete feedback from ${item.name}`}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))
            )}
          </div>

          {/* PAGINATION */}

          {pages > 1 && (
            <div className="admin-pagination">
              <button
                className="pagination-button"
                disabled={page <= 1}
                onClick={() => fetchDashboardData(page - 1)}
              >
                ←
              </button>

              {Array.from({ length: pages }).map((_, index) => {
                const pageNumber = index + 1;

                if (
                  pages > 7 &&
                  pageNumber !== 1 &&
                  pageNumber !== pages &&
                  Math.abs(pageNumber - page) > 1
                ) {
                  if (pageNumber === page - 2 || pageNumber === page + 2) {
                    return (
                      <span key={pageNumber} className="pagination-info">
                        ...
                      </span>
                    );
                  }

                  return null;
                }

                return (
                  <button
                    key={pageNumber}
                    className={`pagination-button ${pageNumber === page ? "active" : ""}`}
                    onClick={() => fetchDashboardData(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                className="pagination-button"
                disabled={page >= pages}
                onClick={() => fetchDashboardData(page + 1)}
              >
                →
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="admin-footer">
        <span>PROJECTMATE FEEDBACK SYSTEM</span>

        <span>● MongoDB Connected</span>
      </footer>

      {/* -----------------------------------
          DELETE MODAL
      ----------------------------------- */}

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2>Delete Feedback</h2>

              <p>
                Are you sure you want to delete feedback from{" "}
                <strong>{deleteTarget.name || "Anonymous"}</strong>? This
                action cannot be undone.
              </p>

              <div className="modal-actions">
                <button
                  className="modal-button secondary"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  className="modal-button danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;
