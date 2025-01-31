/*********************************
 * Dialog System
 * 
 * Provides a simple "chat interface" for multi-line conversations
 *********************************/

const dialogConfig = {
    // An example structure for death dialogues
    death1: [
        { speaker: null, text: "You wake up disoriented and confused."},
        { speaker: "You", text: "Where am I?"},
        { speaker: "You", text: "What happened?"},
        { speaker: "God", text: "You were on your way home when you died, young and drunk and driving your friend's car too fast." },
        { speaker: "God", text: "It was a car accident. Nothing particularly remarkable, but fatal nonetheless." },
        { speaker: "God", text: "You left behind parents a sister and a brother." },
        { speaker: "God", text: "It was a painless death. The EMTs tried their best to save you, but to no avail. Your body was so utterly shattered you were better off, trust me." },
        { speaker: "God", text: "And that's when you met me." },
        { speaker: "You", text: "What… what happened?" },
        { speaker: "You", text: "Where am I?" },
        { speaker: "God", text: "You died," },
        { speaker: "You", text: "There was a deer… a truck and it was skidding…" },
        { speaker: "God", text: "Yup," },
        { speaker: "You", text: "I… I died?" },
        { speaker: "God", text: "Yup. But don't feel bad about it. Everyone dies," },
        { speaker: null, text: "You looked around. There was nothingness. Just you and God." },
        { speaker: "You", text: "What is this place?" },
        { speaker: "You", text: "Is this the afterlife?" },
        { speaker: "God", text: "More or less" },
        { speaker: "You", text: "Are you god?" },
        { speaker: "God", text: "Yup." },
        { speaker: "God", text: "I'm God." },
        { speaker: "You", text: "My parents… my brother and sister," },
        { speaker: "God", text: "What about them?" },
        { speaker: "You", text: "Will they be all right?" },
        { speaker: "God", text: "That's what I like to see," },
        { speaker: "God", text: "You just died and your main concern is for your family. That's good stuff right there." },
        { speaker: null, text: "You looked at God with fascination." },
        { speaker: "You", text: "You don't look like God. You just look like some man, or… a woman?" },
        { speaker: "You", text: "Some vague authority figure, maybe. More of a grammar school teacher than the almighty." },
        { speaker: "God", text: "Don't worry," },
        { speaker: "God", text: "They'll be fine. The world will remember you as perfect in every way. They didn't have time to see you grow old and fat and boring." },
        { speaker: "God", text: "Your parents will be devastated, but this accident scares your brother straight." },
        { speaker: "God", text: "If it makes you feel better, you have averted your brother's addition and overdose from Fentanyl." },
        { speaker: "You", text: "Oh," },
        { speaker: "You", text: "So what happens now? Do I go to heaven or hell or something?" },
        { speaker: "God", text: "Neither," },
        { speaker: "God", text: "You'll be reincarnated." },
        { speaker: "You", text: "Ah," },
        { speaker: "You", text: "So the Hindus were right," },
        { speaker: "God", text: "Not quite" },
        { speaker: "God", text: "But enough talking, you have another life to live" },
        { speaker: "God", text: "And another death to endure, see you soon old friend" }
    ],

    // You can add custom sequences for in-game events:
    // eventIntro: [...],
    // eventSurprise: [...],
    // etc.
  };
  
  // Global or local reference to the current dialogue content & index
  let currentDialog = [];
  let currentDialogIndex = 0;
  let dialogOnDoneCallback = null;
  
  function initDialogSystem() {
    const dialogOverlay = document.createElement("div");
    dialogOverlay.id = "dialog-overlay";
    dialogOverlay.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #fff;
      z-index: 9999;
      padding: 0;
      box-sizing: border-box;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;  /* Center the content horizontally */
    `;
  
    // Content container with max-width
    const contentContainer = document.createElement("div");
    contentContainer.style.cssText = `
      width: 100%;
      max-width: 768px;  /* iPad portrait width */
      height: 100%;
      display: flex;
      flex-direction: column;
    `;
  
    // Header
    const header = document.createElement("div");
    header.style.cssText = `
      padding: 16px;
      background: #f7f9fc;
      border-bottom: 1px solid #eee;
      font-family: 'Patrick Hand', cursive;
      font-size: 1.2em;
      text-align: center;
      flex-shrink: 0;
    `;
    header.textContent = "Conversation";
  
    // Messages container with smooth scroll
    const dialogMessages = document.createElement("div");
    dialogMessages.id = "dialog-messages";
    dialogMessages.style.cssText = `
      flex-grow: 1;
      overflow-y: auto;
      padding: 20px;
      scroll-behavior: smooth;
      background-color: #fff;
    `;
  
    // Footer with tap to continue
    const footer = document.createElement("div");
    footer.style.cssText = `
      padding: 16px;
      background: #f7f9fc;
      border-top: 1px solid #eee;
      text-align: center;
      flex-shrink: 0;
      font-family: 'Patrick Hand', cursive;
      width: 100%;
    `;
    footer.textContent = "Tap anywhere to continue";
  
    // Add click handler to the entire overlay
    dialogOverlay.onclick = renderNextLine;
  
    contentContainer.appendChild(header);
    contentContainer.appendChild(dialogMessages);
    contentContainer.appendChild(footer);
    dialogOverlay.appendChild(contentContainer);
    document.body.appendChild(dialogOverlay);
  }
  
  function showDialog(dialogKey, { onDone } = {}) {
    // Retrieve the array of lines from config
    if (!dialogConfig[dialogKey]) {
      console.warn(`No dialog found for key: ${dialogKey}`);
      if (onDone) onDone();
      return;
    }
    currentDialog = dialogConfig[dialogKey];
    currentDialogIndex = 0;
    dialogOnDoneCallback = onDone || null;
  
    // Clear existing messages
    const dialogMessages = document.getElementById("dialog-messages");
    dialogMessages.innerHTML = "";
  
    // Show overlay
    const overlay = document.getElementById("dialog-overlay");
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
  
    // Render the first line
    renderNextLine();
  }
  
  /**
   * Renders the next line in currentDialog
   */
  function renderNextLine() {
    if (currentDialogIndex >= currentDialog.length) {
      // If no more lines, hide dialog & call onDone
      hideDialog();
      if (dialogOnDoneCallback) {
        dialogOnDoneCallback();
      }
      return;
    }
  
    const line = currentDialog[currentDialogIndex];
    const dialogMessages = document.getElementById("dialog-messages");
  
    // Create message container
    const messageContainer = document.createElement("div");
    messageContainer.style.cssText = `
      margin-bottom: 16px;
      animation: fadeIn 0.3s ease-in;
    `;
  
    // Style based on speaker
    const isPlayer = line.speaker === "Player";
    const isNarration = line.speaker === null;
  
    if (!isNarration) {
      // Add speaker name if not a narration
      const speakerEl = document.createElement("div");
      speakerEl.style.cssText = `
        font-size: 0.9em;
        margin-bottom: 4px;
        color: #666;
        ${isPlayer ? 'text-align: right;' : 'text-align: left;'}
        font-family: 'Patrick Hand', cursive;
      `;
      speakerEl.textContent = line.speaker;
      messageContainer.appendChild(speakerEl);
    }
  
    // Create message bubble
    const textEl = document.createElement("div");
    if (isNarration) {
      // Narration styling
      textEl.style.cssText = `
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 8px 16px;
        margin: 8px 40px;
        font-family: 'Patrick Hand', cursive;
      `;
    } else {
      // Message bubble styling
      textEl.style.cssText = `
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 18px;
        font-family: 'Patrick Hand', cursive;
        ${isPlayer ? `
          margin-left: auto;
          background-color: #007AFF;
          color: white;
          border-bottom-right-radius: 4px;
        ` : `
          margin-right: auto;
          background-color: #E9ECEF;
          color: black;
          border-bottom-left-radius: 4px;
        `}
      `;
    }
    textEl.textContent = line.text;
  
    messageContainer.appendChild(textEl);
    dialogMessages.appendChild(messageContainer);
  
    // Smooth scroll to the new message
    messageContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
  
    currentDialogIndex++;
  }
  
  function hideDialog() {
    const overlay = document.getElementById("dialog-overlay");
    overlay.style.display = "none";
  }

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);