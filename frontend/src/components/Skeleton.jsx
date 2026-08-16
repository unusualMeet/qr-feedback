import { motion } from "framer-motion";

export function Skeleton({ className = "", style = {} }) {
  return (
    <motion.div
      className={`skeleton ${className}`}
      style={style}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function WelcomeSkeleton() {
  return (
    <div className="welcome-screen">
      <div className="tech-grid"></div>

      <div className="welcome-inner">
        <Skeleton className="skeleton-logo" />

        <Skeleton className="skeleton-tag" />

        <Skeleton className="skeleton-emblem" />

        <Skeleton className="skeleton-heading" />

        <Skeleton className="skeleton-description" />

        <Skeleton className="skeleton-button" />

        <div className="welcome-steps">
          <Skeleton className="skeleton-step" />

          <div className="step-divider"></div>

          <Skeleton className="skeleton-step" />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <motion.section
      className="feedback-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="tech-grid"></div>

      <header className="feedback-topbar">
        <Skeleton className="skeleton-logo-sm" />

        <Skeleton className="skeleton-label" />
      </header>

      <div className="feedback-wrapper">
        <Skeleton className="skeleton-heading" />

        <div className="feedback-row">
          <div className="feedback-question">
            <Skeleton className="skeleton-step-number" />

            <div>
              <Skeleton className="skeleton-question-title" />

              <Skeleton className="skeleton-question-text" />
            </div>
          </div>

          <Skeleton className="skeleton-input" />
        </div>

        <div className="feedback-row">
          <div className="feedback-question">
            <Skeleton className="skeleton-step-number" />

            <div>
              <Skeleton className="skeleton-question-title" />

              <Skeleton className="skeleton-question-text" />
            </div>
          </div>

          <div className="experience-rating">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="skeleton-experience-card" />
            ))}
          </div>
        </div>

        <div className="feedback-row">
          <div className="feedback-question">
            <Skeleton className="skeleton-step-number" />

            <div>
              <Skeleton className="skeleton-question-title" />

              <Skeleton className="skeleton-question-text" />
            </div>
          </div>

          <Skeleton className="skeleton-textarea" />
        </div>

        <div className="feedback-row">
          <div className="feedback-question">
            <Skeleton className="skeleton-step-number" />

            <div>
              <Skeleton className="skeleton-question-title" />

              <Skeleton className="skeleton-question-text" />
            </div>
          </div>

          <div className="category-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="skeleton-category-card" />
            ))}
          </div>
        </div>

        <Skeleton className="skeleton-submit" />
      </div>
    </motion.section>
  );
}

export function AdminStatCardSkeleton() {
  return (
    <div className="admin-stat-card">
      <Skeleton className="skeleton-stat-label" />

      <Skeleton className="skeleton-stat-value" />

      <Skeleton className="skeleton-stat-sub" />
    </div>
  );
}

export function AdminTableSkeleton() {
  return (
    <div className="feedback-list">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="feedback-item">
          <div className="feedback-person">
            <Skeleton className="skeleton-avatar" />

            <div>
              <Skeleton className="skeleton-name" />

              <Skeleton className="skeleton-date" />
            </div>
          </div>

          <div className="feedback-main">
            <Skeleton className="skeleton-rating" />

            <Skeleton className="skeleton-message" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
