chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === "TONE_SYNC") {
    // Prepare prompt and instructions
    const prompt = msg.text || "";
    const styleInstruction = msg.style ? `Rewrite this to be ${msg.style}.` : "";
    const toneInstruction = msg.tone ? `Make the tone: ${msg.tone}.` : "";

    const instructions = [styleInstruction, toneInstruction].filter(Boolean).join(" ");

    try {
      // Chrome built-in AI Rewriter API call (Gemini Nano or similar)
      const result = await chrome.ai.rewriter({
        prompt: prompt,
        instructions: instructions
        // You can add: model: "gemini-nano" or other built-in model, if available/required.
      });

      sendResponse({ rewritten: result.output });
    } catch (e) {
      sendResponse({ rewritten: "Rewrite failed." });
    }
    return true; // Required for async sendResponse
  }
});
