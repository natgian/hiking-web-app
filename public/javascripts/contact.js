const form = document.getElementById("my-form");

if (form) {
  async function handleSubmit(event) {
    event.preventDefault();
    const status = document.getElementById("my-form-status");
    var data = new FormData(event.target);
    fetch(event.target.action, {
      method: form.method,
      body: data,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        status.innerHTML = "Thank you for your message. I will get back to you as soon as possible.";
        status.classList.add("alert", "alert-success");
        form.reset()
      } else {
        response.json().then(data => {
          if (Object.hasOwn(data, 'errors')) {
            status.innerHTML = data["errors"].map(error => error["message"]).join(", ")
          } else {
            status.innerHTML = "Oops! There was a problem submitting your form. Please try again.";
            status.classList.add("alert", "alert-warning");
          }
        })
      }
    }).catch(error => {
      status.innerHTML = "Oops! There was a problem submitting your form. Please try again.";
      status.classList.add("alert", "alert-warning");
    });
  }
  form.addEventListener("submit", handleSubmit);
}