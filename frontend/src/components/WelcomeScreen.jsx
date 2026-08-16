import { motion } from "framer-motion";
import logo from "../assets/projectmate-logo.png";
function WelcomeScreen({ onContinue }) {
  return (
    <motion.section
      className="welcome-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.7 }}
    >
      <div className="tech-grid"></div>

      <div className="welcome-glow welcome-glow-left"></div>
      <div className="welcome-glow welcome-glow-right"></div>

      <div className="curve curve-top"></div>
      <div className="curve curve-bottom"></div>

      <div className="floating-dot dot-1"></div>
      <div className="floating-dot dot-2"></div>
      <div className="floating-dot dot-3"></div>
      <div className="floating-dot dot-4"></div>

      <div className="welcome-inner">

        <motion.div
          className="welcome-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <img src={logo} alt="ProjectMate" />
        </motion.div>

        <motion.div
          className="welcome-tag"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span></span>
          PROJECT FEEDBACK
        </motion.div>

        <motion.div
          className="welcome-emblem"
          initial={{
            opacity: 0,
            scale: 0.7,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.55,
            duration: 0.6,
          }}
        >
          ✦
        </motion.div>

        <motion.h1
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.7,
            duration: 0.7,
          }}
        >
          Tell us what
          <br />
          <span>you think.</span>
        </motion.h1>

        <motion.p
          className="welcome-description"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.9,
          }}
        >
          Your perspective helps ideas become
          <br />
          better, clearer and more meaningful.
        </motion.p>

        <motion.button
          className="welcome-main-button"
          onClick={onContinue}
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: 0.97,
          }}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 1.05,
          }}
        >
          <span>Share Your Experience</span>
          <strong>→</strong>
        </motion.button>

        <motion.div
          className="welcome-steps"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.25 }}
        >
          <div className="welcome-step">
            <span>01</span>
            <p>Choose your experience</p>
          </div>

          <div className="step-divider"></div>

          <div className="welcome-step">
            <span>02</span>
            <p>Share your thoughts</p>
          </div>
        </motion.div>
      </div>

      <div className="welcome-footer">
        <span>30 SEC EXPERIENCE</span>

        <div></div>

        <span>YOUR VOICE MATTERS</span>
      </div>
    </motion.section>
  );
}

export default WelcomeScreen;