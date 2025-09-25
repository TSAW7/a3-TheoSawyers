document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("signupForm");
  const messageDiv = document.getElementById("feedback");

  const showFeedback = (msg, isError = false) => {
  const feedback = document.getElementById("feedback");

  feedback.textContent = msg;

  feedback.style.background = isError
    ? "rgba(220, 53, 69, 0.95)" 
    : "rgba(40, 167, 69, 0.95)"


  feedback.classList.remove("flash")
  void feedback.offsetWidth; 
  feedback.classList.add("flash")
};


  const preventDoubleSubmit = async (form, callback) => {
    const submitButton = form.querySelector("button[type=submit]")
    if (submitButton.disabled) return;
    submitButton.disabled = true;
    try {
      await callback();
    } finally {
      submitButton.disabled = false;
    }
  };

  // LOGIN
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    preventDoubleSubmit(loginForm, async () => {
      const username = document.getElementById("loginUsername").value;
      const password = document.getElementById("loginPassword").value;

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });

      const data = await res.json()
      if (res.ok) {
        showFeedback("✅ Login successful! Redirecting...")
        setTimeout(() => window.location.href = "/", 1000)
      } else {
        showFeedback("❌ " + data.message, true)
      }
    });
  });

  // REGISTER
  registerForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    preventDoubleSubmit(registerForm, async () => {
      const username = document.getElementById("signupUsername").value
      const password = document.getElementById("signupPassword").value

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });

      const data = await res.json();
      if (res.ok) {
        showFeedback("✅ Account created! You can now log in.")
      } else {
        showFeedback("❌ " + data.message, true);
      }
    });
  });
});
