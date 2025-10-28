document.addEventListener("DOMContentLoaded", async () => {
  const userText = document.getElementById("userText");
  const resultDiv = document.getElementById("result");
  const toneDetectionDiv = document.getElementById("toneDetection");
  const suggestionsDiv = document.getElementById("suggestions");
  const rewriteBtn = document.getElementById("rewriteBtn");
  const speakBtn = document.getElementById("speakBtn");
  const detectBtn = document.getElementById("detectToneBtn");
  const footer = document.querySelector(".footer");

  let selectedTone = "";
  let detectedTone = "";

  /* ---------------- OFFLINE STATUS ---------------- */
  function updateOfflineStatus() {
    footer.textContent = navigator.onLine
      ? "🟢 Gemini Nano available (on‑device AI ready)."
      : "🟡 Offline mode active – running on device.";
  }
  window.addEventListener("online", updateOfflineStatus);
  window.addEventListener("offline", updateOfflineStatus);
  updateOfflineStatus();

  /* ---------------- SPEECH INPUT ---------------- */
  if ("webkitSpeechRecognition" in window) {
    const rec = new webkitSpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    speakBtn.addEventListener("click", async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        rec.start();
        speakBtn.textContent = "🛑 Stop";
      } catch (e) {
        resultDiv.textContent = "Microphone access denied. Check permissions.";
      }
    });

    rec.onresult = (e) => {
      userText.value = e.results[0][0].transcript;
      speakBtn.textContent = "🎤 Speak";
    };
    rec.onend = () => (speakBtn.textContent = "🎤 Speak");
  } else {
    speakBtn.style.display = "none";
  }

  /* ---------------- TONE DETECTION ---------------- */
  detectBtn.addEventListener("click", async () => {
    const text = userText.value.trim();
    if (!text) {
      toneDetectionDiv.textContent = "Enter or speak some text first.";
      return;
    }

    toneDetectionDiv.textContent = "Detecting tone...";
    suggestionsDiv.innerHTML = "";
    resultDiv.textContent = "";
    rewriteBtn.style.display = "none";

    try {
      if (!("Rewriter" in self)) {
        toneDetectionDiv.textContent = "Gemini Nano not available in this browser.";
        return;
      }

      const availability = await Rewriter.availability();
      if (availability !== "available") {
        toneDetectionDiv.textContent = "Model not ready yet.";
        return;
      }

      const rewriter = await Rewriter.create({
        outputLanguage: "en",
        format: "plain-text",
        sharedContext: "ToneSync AI tone detector."
      });

      detectedTone = await rewriter.rewrite(text, {
        context:
          "Analyze the emotional or stylistic tone of this message in ONE word (e.g., Formal, Casual, Friendly, Serious, Apologetic, Polite, Excited, Neutral).",
      });

      toneDetectionDiv.textContent = `Detected Tone: ${detectedTone}`;
      showDynamicSuggestions(detectedTone);
    } catch (err) {
      toneDetectionDiv.textContent = "Error detecting tone: " + err.message;
    }
  });

  /* ---------------- DYNAMIC SUGGESTIONS ---------------- */
  function showDynamicSuggestions(tone) {
    let choices = [];

    switch (tone.toLowerCase()) {
      case "serious":
        choices = ["Make it Polite", "Make it Casual"];
        break;
      case "apologetic":
        choices = ["Make it Confident", "Make it Formal"];
        break;
      case "friendly":
        choices = ["Make it Professional", "Make it Neutral"];
        break;
      case "excited":
        choices = ["Make it Calm", "Make it Formal"];
        break;
      case "formal":
        choices = ["Make it Casual", "Make it Friendly"];
        break;
      case "polite":
        choices = ["Make it Direct", "Make it Friendly"];
        break;
      default:
        choices = ["Make it Formal", "Make it Casual", "Make it Polite"];
    }

    suggestionsDiv.innerHTML =
      "<b>Suggestions:</b><br>" +
      choices.map(c => `<button class="toneSuggestion">${c}</button>`).join(" ");

    document.querySelectorAll(".toneSuggestion").forEach(btn =>
      btn.addEventListener("click", () => {
        selectedTone = btn.textContent;
        resultDiv.textContent = `Selected: ${selectedTone}`;
        rewriteBtn.style.display = "inline-block";
      })
    );
  }

  /* ---------------- TONE REWRITE ---------------- */
  rewriteBtn.addEventListener("click", async () => {
    const text = userText.value.trim();
    if (!text || !selectedTone) {
      resultDiv.textContent = "Select a tone suggestion before rewriting.";
      return;
    }

    resultDiv.textContent = "Rewriting...";
    try {
      const rewriter = await Rewriter.create({
        outputLanguage: "en",
        format: "plain-text",
        sharedContext: "ToneSync AI rewriter."
      });

      const rewritten = await rewriter.rewrite(text, {
        context: `The current tone is ${detectedTone}. Rewrite the text to sound ${selectedTone.replace("Make it ", "").toLowerCase()} while keeping its meaning.`
      });

      resultDiv.innerHTML = `<b>🪄 Rewritten:</b><br>${rewritten}`;
    } catch (error) {
      resultDiv.textContent = "Rewrite error: " + error.message;
    }
  });
});
