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

    const inject = () => {
      const target = document.querySelector(".trailing_c38106");
      if (!target || document.querySelector(".injected-js-btn")) return;

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
        onclick: () => (frame.style.display = "block")
      });

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
        styles: {
          position: "absolute",
          right: "16px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "700",
          color: "#9B9CA3"
        },
        onclick: () => (frame.style.display = "none")
      });

      header.append(title, closeBtn);
      frame.appendChild(header);

      const content = createEl("div", {
        text: "Miau",
        styles: { padding: "16px", color: "#9B9CA3" }
      });
      frame.appendChild(content);

      document.body.appendChild(frame);
      target.appendChild(btn);
    };

    const observer = new MutationObserver(inject);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    inject();

  } catch (e) {}
})();
