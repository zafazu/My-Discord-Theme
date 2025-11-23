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

    function sendTransparencyCommand(command) {
      const ws = new WebSocket('ws://localhost:8899');

      ws.onopen = function () {
        ws.send(JSON.stringify(command));
        setTimeout(() => ws.close(), 1000);
      };

      ws.onerror = function () {
        showError('Needed Script is not running');
      };
    }

    function setOpacity(percent) {
      sendTransparencyCommand({
        type: 'set_opacity',
        opacity: percent
      });
    }

    function toggleTransparent() {
      sendTransparencyCommand({
        type: 'toggle_transparent'
      });
    }

    function resetTransparency() {
      sendTransparencyCommand({
        type: 'reset'
      });
    }

    window.setOpacity = setOpacity;
    window.toggleTransparent = toggleTransparent;
    window.resetTransparency = resetTransparency;

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
        styles: {
          position: "absolute",
          top: "8px",
          right: "8px",
          background: "transparent",
          border: "none",
          color: "#ff5555",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "16px"
        },
        onclick: () => { errorFrame.remove(); }
      });

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

      let duration = 10;
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

    const showSuccess = (msg) => {
      const successFrame = createEl("div", {
        styles: {
          width: "320px",
          padding: "12px",
          background: "#1e1e1e",
          color: "#fff",
          border: "1px solid #10b981",
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
        styles: {
          position: "absolute",
          top: "8px",
          right: "8px",
          background: "transparent",
          border: "none",
          color: "#10b981",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "16px"
        },
        onclick: () => { successFrame.remove(); }
      });

      const timerBar = createEl("div", {
        styles: {
          height: "4px",
          background: "#10b981",
          width: "100%",
          transition: "width 0.1s linear"
        }
      });

      successFrame.append(msgSpan, closeBtn, timerBar);
      errorContainer.appendChild(successFrame);

      let duration = 10;
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += 0.1;
        const widthPercent = Math.max(0, 100 - (elapsed / duration) * 100);
        timerBar.style.width = widthPercent + "%";
        if (elapsed >= duration) {
          clearInterval(interval);
          successFrame.remove();
        }
      }, 100);
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
          width: "350px",
          height: "320px",
          background: "#1e1e1e",
          color: "#fff",
          borderRadius: "8px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
          zIndex: 2147483647,
          display: "none",
          userSelect: "none",
          overflow: "hidden"
        }
      });

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
      const closeBtn = createEl("div", {
        text: "✕",
        styles: { cursor: "pointer" },
        onclick: () => frame.style.display = "none"
      });

      header.append(title, closeBtn);
      frame.appendChild(header);

      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      header.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - frame.offsetLeft;
        offsetY = e.clientY - frame.offsetTop;
        header.style.cursor = "grabbing";
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        frame.style.left = e.clientX - offsetX + "px";
        frame.style.top = e.clientY - offsetY + "px";
      });

      document.addEventListener("mouseup", () => {
        if (isDragging) header.style.cursor = "grab";
        isDragging = false;
      });

      const content = createEl("div", {
        styles: {
          padding: "20px",
          height: "calc(100% - 49px)",
          display: "flex",
          flexDirection: "column"
        }
      });

      const settingsTitle = createEl("h2", {
        text: "Window Transparency",
        styles: {
          fontSize: "18px",
          fontWeight: "600",
          color: "#fff",
          margin: "0 0 20px 0"
        }
      });

      const sliderContainer = createEl("div", {
        styles: {
          marginBottom: "20px",
          flex: "1"
        }
      });

      const label = createEl("label", {
        text: "Transparency Level",
        styles: {
          display: "block",
          marginBottom: "12px",
          fontSize: "14px",
          fontWeight: "500",
          color: "#fff"
        }
      });

      const sliderWrapper = createEl("div", {
        styles: {
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }
      });

      const slider = createEl("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "100";
      slider.value = "100";
      Object.assign(slider.style, {
        flex: "1",
        height: "6px",
        borderRadius: "3px",
        outline: "none",
        cursor: "pointer",
        background: "#333"
      });

      const valueDisplay = createEl("span", {
        text: "100%",
        styles: {
          minWidth: "45px",
          fontSize: "14px",
          color: "#9B9CA3",
          fontWeight: "500"
        }
      });

      slider.oninput = (e) => {
        valueDisplay.textContent = e.target.value + "%";
      };

      sliderWrapper.append(slider, valueDisplay);
      sliderContainer.append(label, sliderWrapper);

      const buttonContainer = createEl("div", {
        styles: {
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "-30px",
          borderTop: "1px solid rgba(255,255,255,0.08)"
        }
      });

      const applyButton = createEl("button", {
        text: "Apply",
        styles: {
          padding: "8px 20px",
          borderRadius: "6px",
          cursor: "pointer",
          background: "#10b981",
          color: "#fff",
          fontWeight: "600",
          border: "none",
          fontSize: "14px",
          transition: "background 0.2s",
          marginTop: "10px"
        },
        onclick: () => {
          const table = {
            "DV_SETTINGS": {
              "windowTransparency": parseInt(slider.value)
            }
          };
          console.log("[DV_SETTINGS]", JSON.stringify(table));
          showSuccess(`${slider.value}% transparency applied`);
        }
      });

      applyButton.onmouseenter = () => applyButton.style.background = "#059669";
      applyButton.onmouseleave = () => applyButton.style.background = "#10b981";

      buttonContainer.appendChild(applyButton);
      content.append(settingsTitle, sliderContainer, buttonContainer);
      frame.appendChild(content);
      document.body.appendChild(frame);

      const btn = createEl("button", {
        class: "injected-js-btn",
        text: "DV",
        styles: {
          padding: "6px 8px",
          borderRadius: "6px",
          marginLeft: "16px",
          cursor: "pointer",
          background: "transparent",
          color: "#9B9CA3",
          fontWeight: "700",
          border: "none"
        },
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
    };

    inject();
    const observer = new MutationObserver(inject);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // all hotkeys removed

  } catch (e) {
    console.error("Script Error:", e);
    showError("Unexpected Error: " + e.message);
  }
})();
