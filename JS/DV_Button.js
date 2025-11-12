(function () {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const createEl = (tag, options = {}) => {
      const el = document.createElement(tag);
      if (options.text) el.textContent = options.text;
      if (options.class) el.className = options.class;
      if (options.styles) Object.assign(el.style, options.styles);
      if (options.onclick) el.onclick = options.onclick;
      return el;
    };

    const inject = async () => {
      const target = document.querySelector(".upperContainer__9293f");
      if (!target || document.querySelector(".injected-js-btn")) return;

      const frame = createEl("div", {
        styles: {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "0",
          background: "#1e1e1e",
          color: "#fff",
          borderRadius: "8px",
          zIndex: 2147483647,
          display: "none",
          width: "500px",
          height: "500px",
          textAlign: "left",
          boxShadow: "0 8px 30px rgba(0,0,0,0.6)"
        }
      });

      const header = createEl("div", {
        styles: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          width: "100%",
          padding: "12px 16px",
          fontWeight: "700",
          fontSize: "15px",
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        }
      });
      const title = createEl("span", { text: "DarkVisionJS v1" });
      const closeBtn = createEl("div", {
        text: "✕",
        styles: { position: "absolute", right: "50px", cursor: "pointer", fontSize: "16px", fontWeight: "700", color: "#9B9CA3" },
        onclick: () => (frame.style.display = "none")
      });
      header.append(title, closeBtn);
      frame.appendChild(header);

      const content = createEl("div", { styles: { padding: "20px" } });

      const settingsTitle = createEl("h2", {
        text: "Settings",
        styles: { margin: "0 0 24px 0", fontSize: "18px", fontWeight: "600", color: "#fff" }
      });

      const createSliderRow = (labelText) => {
        const row = createEl("div", { styles: { marginBottom: "16px" } });
        const label = createEl("label", { text: labelText, styles: { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#fff" } });
        const container = createEl("div", { styles: { display: "flex", alignItems: "center", gap: "12px" } });
        const slider = createEl("input");
        slider.type = "range";
        slider.min = "0";
        slider.max = "100";
        slider.value = "0";
        Object.assign(slider.style, { flex: "1", height: "4px", borderRadius: "2px", outline: "none", cursor: "pointer" });
        const valueDisplay = createEl("span", { text: "0%", styles: { minWidth: "45px", fontSize: "14px", color: "#9B9CA3", fontWeight: "500" } });
        slider.oninput = (e) => { valueDisplay.textContent = e.target.value + "%"; };
        container.append(slider, valueDisplay);
        row.append(label, container);
        return { row, slider };
      };

      const { row: transparencyRow, slider: transparencySlider } = createSliderRow("Window Transparency");
      const { row: blurRow, slider: blurSlider } = createSliderRow("Window Blur");
      blurRow.style.marginBottom = "24px";

      const setButton = createEl("button", {
        text: "Set Window Settings",
        styles: {
          padding: "10px 24px",
          borderRadius: "6px",
          cursor: "pointer",
          background: "#3b82f6",
          color: "#fff",
          fontWeight: "600",
          border: "none",
          fontSize: "14px",
          transition: "background 0.2s"
        },
        onclick: async () => {
          console.log("Button clicked");
          const data = {
            windowTransparency: parseInt(transparencySlider.value),
            windowBlur: parseInt(blurSlider.value)
          };
          try {
            const res = await fetch("http://127.0.0.1:8899", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data)
            });
            console.log(await res.text());
          } catch (err) { console.error("Error posting settings:", err); }
        }
      });
      setButton.onmouseenter = () => { setButton.style.background = "#2563eb"; };
      setButton.onmouseleave = () => { setButton.style.background = "#3b82f6"; };

      content.append(settingsTitle, transparencyRow, blurRow, setButton);
      frame.appendChild(content);
      document.body.appendChild(frame);

      const btn = createEl("button", {
        class: "injected-js-btn",
        text: "DV",
        styles: { padding: "6px 8px", borderRadius: "6px", marginLeft: "16px", cursor: "pointer", background: "transparent", color: "#9B9CA3", fontWeight: "700", border: "none" },
        onclick: () => (frame.style.display = "block")
      });
      target.appendChild(btn);

      // Load initial settings
      (async () => {
        try {
          const res = await fetch("http://127.0.0.1:8899");
          const settings = await res.json();
          if (settings.windowTransparency !== undefined) transparencySlider.value = settings.windowTransparency;
          if (settings.windowBlur !== undefined) blurSlider.value = settings.windowBlur;
          transparencySlider.oninput({ target: transparencySlider });
          blurSlider.oninput({ target: blurSlider });
        } catch (e) { console.warn("Could not load settings:", e); }
      })();
    };

    const observer = new MutationObserver(inject);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    inject();
  } catch (e) {}
})();
