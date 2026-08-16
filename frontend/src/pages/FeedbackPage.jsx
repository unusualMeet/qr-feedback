import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import WelcomeScreen from "../components/WelcomeScreen";
import FeedbackForm from "../components/FeedbackForm";
import ThankYou from "../components/ThankYou";

function FeedbackPage() {
  const [screen, setScreen] = useState("welcome");

  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen("form");
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="app">
      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <WelcomeScreen
            key="welcome"
            onContinue={() => setScreen("form")}
          />
        )}

        {screen === "form" && (
          <FeedbackForm
            key="form"
            onSubmitted={() => setScreen("thankyou")}
          />
        )}

        {screen === "thankyou" && (
          <ThankYou key="thankyou" />
        )}
      </AnimatePresence>
    </main>
  );
}

export default FeedbackPage;