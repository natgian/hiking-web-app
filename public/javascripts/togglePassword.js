const togglePasswords = document.querySelectorAll(".togglePassword");

togglePasswords.forEach(togglePassword => {
  togglePassword.addEventListener("click", () => {
    const passwordInput = togglePassword.closest(".input-group").querySelector(".password-input");
    const eyeIcon = document.querySelector(".eyeIcon");

    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";

    passwordInput.setAttribute("type", type);

    if (type === "password") {
      eyeIcon.setAttribute("src", "/images/eye-off-outline.svg");
    } else {
      eyeIcon.setAttribute("src", "/images/eye-outline.svg");
    }
  });
});
