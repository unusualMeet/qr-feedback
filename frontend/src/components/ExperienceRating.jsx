import { motion } from "framer-motion";
const experiences = [
  {
    value: 1,
    emoji: "😞",
    label: "Needs Work",
  },
  {
    value: 2,
    emoji: "😕",
    label: "Could Improve",
  },
  {
    value: 3,
    emoji: "😐",
    label: "Good",
  },
  {
    value: 4,
    emoji: "😊",
    label: "Very Good",
  },
  {
    value: 5,
    emoji: "🤩",
    label: "Outstanding",
  },
];

function ExperienceRating({ rating, setRating }) {
  return (
    <div className="experience-rating">

      {experiences.map((item) => (
        <motion.button
          key={item.value}
          type="button"
          className={`experience-card ${
            rating === item.value ? "selected" : ""
          }`}
          onClick={() => setRating(item.value)}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="experience-emoji">
            {item.emoji}
          </span>

          <span className="experience-label">
            {item.label}
          </span>

          {rating === item.value && (
            <span className="experience-check">
              ✓
            </span>
          )}
        </motion.button>
      ))}

    </div>
  );
}

export default ExperienceRating;
