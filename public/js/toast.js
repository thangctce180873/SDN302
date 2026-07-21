(function () {
  let toastContainer = null;

  function ensureToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "ns-toast-container";
      toastContainer.className = "ns-toast-container";
      toastContainer.setAttribute("aria-live", "polite");
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  const TOAST_META = {
    success: { icon: "fa-check-circle", title: "Thành công" },
    error: { icon: "fa-times-circle", title: "Thất bại" },
    warning: { icon: "fa-exclamation-triangle", title: "Cảnh báo" },
    info: { icon: "fa-info-circle", title: "Thông báo" },
  };

  function showToast(message, type, duration) {
    if (typeof type !== "string") {
      duration = type;
      type = "info";
    }
    type = TOAST_META[type] ? type : "info";
    duration = duration || 4200;

    const meta = TOAST_META[type];
    const container = ensureToastContainer();
    const toast = document.createElement("div");
    toast.className = "ns-toast ns-toast-" + type;
    toast.innerHTML =
      '<div class="ns-toast-icon"><i class="fas ' +
      meta.icon +
      '"></i></div>' +
      '<div class="ns-toast-body">' +
      '<strong class="ns-toast-title">' +
      meta.title +
      "</strong>" +
      '<p class="ns-toast-msg">' +
      escapeHtml(String(message || "")) +
      "</p>" +
      "</div>" +
      '<button type="button" class="ns-toast-close" aria-label="Đóng"><i class="fas fa-times"></i></button>';

    const remove = () => {
      toast.classList.add("ns-toast-out");
      setTimeout(() => toast.remove(), 280);
    };

    toast.querySelector(".ns-toast-close").addEventListener("click", remove);
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("ns-toast-in"));

    const timer = setTimeout(remove, duration);
    toast.addEventListener("mouseenter", () => clearTimeout(timer));
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showConfirm(message, options) {
    options = options || {};
    return new Promise(function (resolve) {
      const overlay = document.createElement("div");
      overlay.className = "ns-confirm-overlay";
      overlay.innerHTML =
        '<div class="ns-confirm-box" role="dialog" aria-modal="true">' +
        '<div class="ns-confirm-icon"><i class="fas fa-question-circle"></i></div>' +
        '<h3 class="ns-confirm-title">' +
        escapeHtml(options.title || "Xác nhận") +
        "</h3>" +
        '<p class="ns-confirm-msg">' +
        escapeHtml(String(message || "")) +
        "</p>" +
        '<div class="ns-confirm-actions">' +
        '<button type="button" class="btn btn-outline ns-confirm-cancel">' +
        escapeHtml(options.cancelText || "Hủy") +
        "</button>" +
        '<button type="button" class="btn btn-primary ns-confirm-ok">' +
        escapeHtml(options.confirmText || "Đồng ý") +
        "</button>" +
        "</div></div>";

      const close = (result) => {
        overlay.classList.add("ns-confirm-out");
        setTimeout(() => {
          overlay.remove();
          resolve(result);
        }, 200);
      };

      overlay.querySelector(".ns-confirm-cancel").addEventListener("click", () => close(false));
      overlay.querySelector(".ns-confirm-ok").addEventListener("click", () => close(true));
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close(false);
      });

      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add("ns-confirm-in"));
      overlay.querySelector(".ns-confirm-ok").focus();
    });
  }

  window.showToast = showToast;
  window.showConfirm = showConfirm;
  window.showSuccess = (msg, d) => showToast(msg, "success", d);
  window.showError = (msg, d) => showToast(msg, "error", d);
  window.showWarning = (msg, d) => showToast(msg, "warning", d);
})();
