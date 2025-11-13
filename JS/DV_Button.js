(function () {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // =========================
    // START: Helper Functions
    // =========================
    const createEl = (tag, options = {}) => {
      const el = document.createElement(tag);
      if (options.text) el.textContent = options.text;
      if (options.class) el.className = options.class;
      if (options.styles) Object.assign(el.style, options.styles);
      if (options.onclick) el.onclick = options.onclick;
      return el;
    };
    // =========================
    // END: Helper Functions
    // =========================

    // =========================
    // START: Error Message Function
    // =========================
    const errorContainerId = "dv-error-container";
    let errorContainer = document.getElementById(errorContainerId);
    if (!errorContainer) {
      errorContainer = createEl("div", {
        id: errorContainerId,
        styles: {
          position: "fixed",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "flex-end",
          gap: "8px",
          zIndex: 2147483648
        }
      });
      document.body.appendChild(errorContainer);
    }

    const showError = (msg) => {
      const audio = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEA..."); // Placeholder for Windows error sound
      audio.play().catch(() => {});

      const errorFrame = createEl("div", {
        styles: {
          width: "320px",
          padding: "12px",
          background: "#1e1e1e",
          color: "#fff",
          border: "1px solid #ff5555",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          fontSize: "14px",
          lineHeight: "1.4",
          position: "relative",
          overflow: "hidden"
        }
      });

      const msgSpan = createEl("span", { text: msg, styles: { marginBottom: "8px" } });
      const closeBtn = createEl("button", {
        text: "✕",
        styles: { position: "absolute", top: "8px", right: "8px", background: "transparent", border: "none", color: "#ff5555", cursor: "pointer", fontWeight: "700", fontSize: "16px" },
        onclick: () => { errorFrame.remove(); }
      });

      // Timer bar
      const timerBar = createEl("div", {
        styles: {
          height: "4px",
          background: "#ff5555",
          width: "100%",
          transition: "width 0.1s linear"
        }
      });

      errorFrame.append(msgSpan, closeBtn, timerBar);
      errorContainer.appendChild(errorFrame);

      let duration = 10; // seconds
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += 0.1;
        const widthPercent = Math.max(0, 100 - (elapsed / duration) * 100);
        timerBar.style.width = widthPercent + "%";
        if (elapsed >= duration) {
          clearInterval(interval);
          errorFrame.remove();
        }
      }, 100);
    };
    // =========================
    // END: Error Message Function
    // =========================

    // =========================
    // START: DV Button / Window UI
    // =========================
    const inject = async () => {
      const target = document.querySelector(".upperContainer__9293f");
      if (!target || document.querySelector(".injected-js-btn")) return;

      const frame = createEl("div", {
        styles: {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          background: "#1e1e1e",
          color: "#fff",
          borderRadius: "8px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
          zIndex: 2147483647,
          display: "none",
          userSelect: "none"
        }
      });

      // --- START: Header ---
      const header = createEl("div", {
        styles: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          fontWeight: "700",
          fontSize: "15px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          cursor: "grab"
        }
      });
      const title = createEl("span", { text: "DarkVisionJS v1" });
      const closeBtn = createEl("div", { text: "✕", styles: { cursor: "pointer" }, onclick: () => frame.style.display = "none" });
      header.append(title, closeBtn);
      frame.appendChild(header);
      // --- END: Header ---

      // --- START: Content & Sliders ---
      const content = createEl("div", { styles: { padding: "20px" } });
      const settingsTitle = createEl("h2", { text: "Settings", styles: { fontSize: "18px", fontWeight: "600", color: "#fff", margin: "0 0 24px 0" } });

      const createSliderRow = (labelText) => {
        const row = createEl("div", { styles: { marginBottom: "16px" } });
        const label = createEl("label", { text: labelText, styles: { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#fff" } });
        const container = createEl("div", { styles: { display: "flex", alignItems: "center", gap: "12px" } });
        const slider = createEl("input");
        slider.type = "range"; slider.min = "0"; slider.max = "100"; slider.value = "0";
        Object.assign(slider.style, { flex: "1", height: "4px", borderRadius: "2px", outline: "none", cursor: "pointer" });
        const valueDisplay = createEl("span", { text: "0%", styles: { minWidth: "45px", fontSize: "14px", color: "#9B9CA3", fontWeight: "500" } });
        slider.oninput = (e) => valueDisplay.textContent = e.target.value + "%";
        container.append(slider, valueDisplay);
        row.append(label, container);
        return { row, slider };
      };

      const { row: transparencyRow, slider: transparencySlider } = createSliderRow("Window Transparency");
      const { row: blurRow, slider: blurSlider } = createSliderRow("Window Blur");
      blurRow.style.marginBottom = "24px";

      const setButton = createEl("button", {
        text: "Set Window Settings",
        styles: { padding: "10px 24px", borderRadius: "6px", cursor: "pointer", background: "#3b82f6", color: "#fff", fontWeight: "600", border: "none", fontSize: "14px", transition: "background 0.2s" },
        onclick: async () => {
          try {
            const data = { windowTransparency: parseInt(transparencySlider.value), windowBlur: parseInt(blurSlider.value) };
            const res = await fetch("http://127.0.0.1:8899", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
            console.log(await res.text());
          } catch (err) { console.error(err); showError("Error sending settings: " + err.message); }
        }
      });
      setButton.onmouseenter = () => setButton.style.background = "#2563eb";
      setButton.onmouseleave = () => setButton.style.background = "#3b82f6";

      content.append(settingsTitle, transparencyRow, blurRow, setButton);
      frame.appendChild(content);
      document.body.appendChild(frame);
      // --- END: Content & Sliders ---

      // --- START: DV Button ---
      const btn = createEl("button", {
        class: "injected-js-btn",
        text: "DV",
        styles: { padding: "6px 8px", borderRadius: "6px", marginLeft: "16px", cursor: "pointer", background: "transparent", color: "#9B9CA3", fontWeight: "700", border: "none" },
        onclick: () => {
          frame.style.display = "block";
          if (!frame.dataset.positioned) {
            const rect = frame.getBoundingClientRect();
            frame.style.left = rect.left + "px";
            frame.style.top = rect.top + "px";
            frame.style.transform = "none";
            frame.dataset.positioned = "true";
          }
        }
      });
      target.appendChild(btn);
      // --- END: DV Button ---

    };
    inject();
    const observer = new MutationObserver(inject);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // =========================
    // START: Test Error with F4
    // =========================
    window.addEventListener("keydown", (e) => { if (e.key === "F4" && document.hasFocus()) showError("Test Error: F4 pressed"); });
    // =========================
    // END: Test Error with F4

  } catch (e) {
    // =========================
    // START: Catch-all Error
    // =========================
    console.error("Script Error:", e);
    showError("Unexpected Error: " + e.message);
    // =========================
    // END: Catch-all Error
  }
})();
