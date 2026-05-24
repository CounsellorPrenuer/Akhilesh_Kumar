(function () {
  const API_BASE =
    window.CLARIVEDA_API_BASE || "https://clariveda-payments-gateway.sarwatemihika.workers.dev/api";
  const CURRENCY = "INR";

  const state = {
    selectedPlan: null,
    baseAmount: 0,
    couponCode: "",
    discountAmount: 0,
    finalAmount: 0,
  };

  function text(node) {
    return (node?.textContent || "").trim();
  }

  function parseAmountFromText(raw) {
    const number = (raw || "").replace(/[^\d]/g, "");
    return number ? Number(number) : 0;
  }

  function parsePlanFromCard(card) {
    const title =
      text(card.querySelector("h3")) ||
      text(card.querySelector("h4")) ||
      text(card.querySelector(".text-xl")) ||
      "ClariVeda Plan";
    const amountText =
      text(card.querySelector(".text-2xl")) ||
      text(card.querySelector(".text-lg.font-black")) ||
      "0";
    const amount = parseAmountFromText(amountText);
    return { title, amount };
  }

  function formatINR(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: CURRENCY,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function createModal() {
    const backdrop = document.createElement("div");
    backdrop.className = "cv-modal-backdrop";
    backdrop.id = "cv-checkout-modal";
    backdrop.innerHTML = `
      <div class="cv-modal" role="dialog" aria-modal="true" aria-label="Checkout">
        <div class="cv-modal-head">
          <p class="cv-modal-title">Complete Your Registration</p>
          <button class="cv-close-btn" type="button" data-close-modal aria-label="Close">✕</button>
        </div>
        <div class="cv-form-wrap">
          <div class="cv-grid">
            <div class="full"><input id="cv-name" class="cv-input" placeholder="Full Name *" /></div>
            <div><input id="cv-email" class="cv-input" type="email" placeholder="Email *" /></div>
            <div><input id="cv-phone" class="cv-input" placeholder="Phone *" /></div>
            <div class="full cv-row">
              <input id="cv-coupon" class="cv-input" placeholder="Coupon code" />
              <button id="cv-apply-coupon" class="cv-btn cv-btn-secondary" type="button">Apply</button>
            </div>
          </div>
          <div class="cv-price-box">
            <div class="cv-price-line"><span>Selected Plan</span><strong id="cv-plan-name">-</strong></div>
            <div class="cv-price-line"><span>Original</span><strong id="cv-original">₹0</strong></div>
            <div class="cv-price-line"><span>Discount</span><strong id="cv-discount">₹0</strong></div>
            <div class="cv-price-line cv-price-final"><span>Payable</span><strong id="cv-payable">₹0</strong></div>
          </div>
          <button id="cv-pay" class="cv-btn cv-btn-primary full" style="width:100%;margin-top:12px;" type="button">Proceed To Pay</button>
          <p class="cv-note">Your payment is securely processed through Razorpay.</p>
          <p id="cv-msg" class="cv-msg"></p>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    return backdrop;
  }

  function setMessage(msg, type) {
    const el = document.getElementById("cv-msg");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "cv-msg" + (type ? ` ${type}` : "");
  }

  function refreshPriceUI() {
    document.getElementById("cv-plan-name").textContent = state.selectedPlan?.title || "-";
    document.getElementById("cv-original").textContent = formatINR(state.baseAmount || 0);
    document.getElementById("cv-discount").textContent = formatINR(state.discountAmount || 0);
    document.getElementById("cv-payable").textContent = formatINR(state.finalAmount || 0);
  }

  async function postJSON(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 404 || res.status === 405) {
        throw new Error(
          "Payment API is not live yet. Please connect Cloudflare Worker route for /api/* to enable checkout."
        );
      }
      throw new Error(data?.error || `Request failed: ${res.status}`);
    }
    return data;
  }

  async function applyCoupon() {
    const code = (document.getElementById("cv-coupon").value || "").trim();
    state.couponCode = code;
    if (!code) {
      state.discountAmount = 0;
      state.finalAmount = state.baseAmount;
      refreshPriceUI();
      setMessage("Coupon cleared.", "success");
      return;
    }
    try {
      setMessage("Validating coupon...");
      const data = await postJSON(`${API_BASE}/coupon/validate`, {
        amount: state.baseAmount,
        code,
        planTitle: state.selectedPlan?.title || "",
      });
      state.discountAmount = data.discountAmount || 0;
      state.finalAmount = data.finalAmount || state.baseAmount;
      refreshPriceUI();
      setMessage("Coupon applied successfully.", "success");
    } catch (err) {
      state.discountAmount = 0;
      state.finalAmount = state.baseAmount;
      refreshPriceUI();
      setMessage(err.message || "Invalid coupon.", "error");
    }
  }

  async function openRazorpayCheckout(orderData, customer) {
    if (!window.Razorpay) {
      throw new Error("Razorpay SDK not loaded.");
    }
    const options = {
      key: orderData.keyId,
      amount: orderData.amountPaise,
      currency: CURRENCY,
      name: "ClariVeda",
      description: state.selectedPlan?.title || "Program Enrollment",
      order_id: orderData.orderId,
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      theme: { color: "#3047d8" },
      handler: async function (response) {
        try {
          await postJSON(`${API_BASE}/payment/verify`, {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          setMessage("Payment successful. Confirmation sent.", "success");
          await postJSON(`${API_BASE}/contact`, {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            message: `Paid successfully for ${state.selectedPlan?.title}. Coupon: ${state.couponCode || "None"}`,
            source: "payment-success",
          }).catch(() => {});
          setTimeout(closeModal, 1200);
        } catch (e) {
          setMessage(e.message || "Payment verification failed.", "error");
        }
      },
      modal: {
        ondismiss: function () {
          setMessage("Payment window closed.", "error");
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  async function startPayment() {
    const name = document.getElementById("cv-name").value.trim();
    const email = document.getElementById("cv-email").value.trim();
    const phone = document.getElementById("cv-phone").value.trim();
    if (!name || !email || !phone) {
      setMessage("Please fill name, email and phone.", "error");
      return;
    }
    if (!state.finalAmount || state.finalAmount < 1) {
      setMessage("Invalid payment amount.", "error");
      return;
    }
    try {
      setMessage("Creating payment order...");
      const orderData = await postJSON(`${API_BASE}/payment/create-order`, {
        amount: state.baseAmount,
        couponCode: state.couponCode || "",
        planTitle: state.selectedPlan?.title || "",
        customer: { name, email, phone },
      });
      setMessage("Opening Razorpay...");
      await openRazorpayCheckout(orderData, { name, email, phone });
    } catch (err) {
      setMessage(err.message || "Payment initialization failed.", "error");
    }
  }

  function attachPaymentButtons(modal) {
    const buttons = Array.from(document.querySelectorAll("button"));
    buttons
      .filter((btn) => {
        const label = text(btn).toLowerCase();
        return label === "buy now" || label === "register now";
      })
      .forEach((btn) => {
        btn.addEventListener("click", function () {
          const card = btn.closest("article") || btn.parentElement;
          const plan = parsePlanFromCard(card);
          state.selectedPlan = plan;
          state.baseAmount = plan.amount;
          state.discountAmount = 0;
          state.finalAmount = plan.amount;
          state.couponCode = "";
          document.getElementById("cv-coupon").value = "";
          refreshPriceUI();
          setMessage("");
          modal.classList.add("open");
        });
      });
  }

  function closeModal() {
    const modal = document.getElementById("cv-checkout-modal");
    if (modal) modal.classList.remove("open");
  }

  function wireContactForm() {
    const form = document.querySelector('section#contact form');
    if (!form) return;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const inputs = form.querySelectorAll("input, textarea");
      const [nameInput, phoneInput, emailInput, messageInput] = inputs;
      const payload = {
        name: nameInput?.value?.trim() || "",
        phone: phoneInput?.value?.trim() || "",
        email: emailInput?.value?.trim() || "",
        message: messageInput?.value?.trim() || "",
        source: "contact-form",
      };
      if (!payload.name || !payload.phone || !payload.email) {
        alert("Please fill name, phone and email.");
        return;
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      const old = submitBtn?.textContent || "Send Enquiry";
      if (submitBtn) submitBtn.textContent = "Sending...";
      try {
        await postJSON(`${API_BASE}/contact`, payload);
        alert("Thanks. Your enquiry has been sent successfully.");
        form.reset();
      } catch (err) {
        alert(err.message || "Unable to send enquiry right now.");
      } finally {
        if (submitBtn) submitBtn.textContent = old;
      }
    });
  }

  function wireModalEvents(modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.closest("[data-close-modal]")) {
        closeModal();
      }
    });
    document.getElementById("cv-apply-coupon").addEventListener("click", applyCoupon);
    document.getElementById("cv-pay").addEventListener("click", startPayment);
  }

  function boot() {
    const modal = createModal();
    attachPaymentButtons(modal);
    wireModalEvents(modal);
    wireContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
