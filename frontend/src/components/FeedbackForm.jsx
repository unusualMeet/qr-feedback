import { useState } from "react";
import { motion } from "framer-motion";

import ExperienceRating from "./ExperienceRating";
import { submitFeedback } from "../services/api";
import { toast } from "./Toast";

import logo from "../assets/projectmate-logo.png";
const categoriesList = [
  {
    name: "Presentation",
    icon: "◇",
    description: "Clarity, confidence & delivery",
  },
  {
    name: "Explanation",
    icon: "☆",
    description: "How clearly the concept was explained",
  },
  {
    name: "Project Idea",
    icon: "♧",
    description: "Relevance, usefulness & problem solving",
  },
  {
    name: "Innovation",
    icon: "↗",
    description: "Creativity, uniqueness & originality",
  },
  {
    name: "Technical Knowledge",
    icon: "</>",
    description: "Technical understanding & implementation",
  },
  {
    name: "Design & UI",
    icon: "▣",
    description: "Visual design, usability & experience",
  },
];

function FeedbackForm({ onSubmitted }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (category) => {
    setCategories((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (!rating) {
      toast.error("Please select your experience.");
      return;
    }

    try {
      setLoading(true);

      const result = await submitFeedback({
        name: name.trim(),
        rating,
        feedback: feedback.trim(),
        categories,
      });

      if (result.success) {
        toast.success("Feedback submitted successfully");
        onSubmitted();
      } else {
        toast.error(result.message || "Unable to submit feedback.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      className="feedback-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="tech-grid"></div>

      <div className="feedback-glow"></div>

      <header className="feedback-topbar">
        <img src={logo} alt="ProjectMate" />

        <div className="feedback-label">
          <span></span>
          YOUR FEEDBACK
        </div>
      </header>

      <div className="feedback-wrapper">

        <div className="feedback-heading">
          <p>PROJECT FEEDBACK</p>

          <h1>
            Share your
            <br />
            <span>experience.</span>
          </h1>

          <div className="heading-line"></div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* NAME */}

          <div className="feedback-row">
            <div className="feedback-question">
              <div className="step-number">01</div>

              <div>
                <h2>
                  What's your name?
                  <span>*</span>
                </h2>

                <p>
                  We'd love to know who we're hearing from.
                </p>
              </div>
            </div>

            <div className="feedback-control">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                maxLength={80}
              />
            </div>
          </div>

          {/* EXPERIENCE */}

          <div className="feedback-row rating-row">
            <div className="feedback-question">
              <div className="step-number">02</div>

              <div>
                <h2>How did it feel?</h2>

                <p>
                  Choose the feeling that best describes
                  your experience.
                </p>
              </div>
            </div>

            <div className="feedback-control">
              <ExperienceRating
                rating={rating}
                setRating={setRating}
              />
            </div>
          </div>

          {/* WRITTEN FEEDBACK */}

          <div className="feedback-row">
            <div className="feedback-question">
              <div className="step-number">03</div>

              <div>
                <h2>
                  Tell us more
                  <small>OPTIONAL</small>
                </h2>

                <p>
                  Share anything you'd like us to know.
                </p>
              </div>
            </div>

            <div className="feedback-control textarea-control">
              <textarea
                placeholder="Write your thoughts here..."
                value={feedback}
                onChange={(event) =>
                  setFeedback(event.target.value)
                }
                maxLength={1000}
              />

              <span>
                {feedback.length} / 1000
              </span>
            </div>
          </div>

          {/* CATEGORIES */}

          <div className="feedback-row category-row">
            <div className="feedback-question">
              <div className="step-number">04</div>

              <div>
                <h2>
                  What would you like to review?
                  <small>OPTIONAL</small>
                </h2>

                <p>
                  Select the areas that stood out to you.
                </p>
              </div>
            </div>

            <div className="feedback-control">

              <div className="category-grid">
                {categoriesList.map((category) => {
                  const selected =
                    categories.includes(category.name);

                  return (
                    <motion.button
                      type="button"
                      key={category.name}
                      className={`category-card ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() =>
                        toggleCategory(category.name)
                      }
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="category-icon">
                        {category.icon}
                      </div>

                      <div className="category-info">
                        <h3>{category.name}</h3>
                        <p>{category.description}</p>
                      </div>

                      <div
                        className={`category-check ${
                          selected ? "active" : ""
                        }`}
                      >
                        {selected ? "✓" : ""}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          <motion.button
            className="submit-feedback"
            type="submit"
            disabled={loading}
            whileHover={{
              scale: loading ? 1 : 1.01,
            }}
            whileTap={{
              scale: loading ? 1 : 0.98,
            }}
          >
            {loading ? (
              <>
                <span className="submit-loader"></span>
                Sending...
              </>
            ) : (
              <>
                Submit Feedback
                <span>→</span>
              </>
            )}
          </motion.button>

          <p className="required-text">
            * Required fields
          </p>

        </form>
      </div>
    </motion.section>
  );
}

export default FeedbackForm;
