import { motion } from "framer-motion";

import logo from "../assets/projectmate-logo.png";
function ThankYou() {
  return (
    <motion.section
      className="thank-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <div className="tech-grid"></div>

      <div className="thank-glow"></div>

      <div className="curve thank-curve-left"></div>
      <div className="curve thank-curve-right"></div>

      <header className="thank-logo">
        <img src={logo} alt="ProjectMate" />
      </header>

      <div className="thank-content">

        <motion.div
          className="success-ring"
          initial={{
            scale: 0,
            rotate: -20,
          }}
          animate={{
            scale: 1,
            rotate: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 170,
            damping: 12,
          }}
        >
          <span>✓</span>
        </motion.div>

        <motion.p
          className="thank-status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span></span>
          RESPONSE RECEIVED
        </motion.p>

        <motion.h1
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.55,
          }}
        >
          Thank <span>you!</span>
        </motion.h1>

        <motion.p
          className="thank-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
        >
          Your perspective has been recorded.
          <br />
          Every response helps make the next
          <br />
          experience better.
        </motion.p>

        <motion.div
          className="thank-line"
          initial={{ width: 0 }}
          animate={{ width: 70 }}
          transition={{
            delay: 0.95,
            duration: 0.5,
          }}
        />

        <motion.p
          className="thank-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
        >
          ♥ &nbsp; THANK YOU FOR TAKING THE TIME &nbsp; ♥
        </motion.p>

      </div>
    </motion.section>
  );
}

export default ThankYou;