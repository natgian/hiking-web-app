const validPassword = function validatePassword() {
  const password = document.getElementById("password").value;
  const confirm_password = document.getElementById("confirm_password").value;

  if (password != confirm_password) {
    alert("Passwords do not match. Please try again.");
    return false;
  }
  return true;
}
document.getElementById("signup_form").onsubmit = validatePassword;