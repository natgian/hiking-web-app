const togglePassword = document.querySelector("#togglePassword");
  const password = document.querySelector("#password");
  const eyeIcon = document.querySelector("#eyeIcon");

  togglePassword.addEventListener("click", () => {
    const type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
    // Clear previous content
    eyeIcon.innerHTML = "";
    // Toggle the eye icon
    if (type === "password") {
      eyeIcon.setAttribute("src", "/images/eye-off-outline.svg");
    } else {
      eyeIcon.setAttribute("src", "/images/eye-outline.svg");
    }
  });