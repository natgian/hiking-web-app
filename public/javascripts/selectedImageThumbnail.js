const selectImageUpload = document.getElementById("images");
const formFile = document.getElementById("formFile");

selectImageUpload.addEventListener("change", (event) => {
  const previews = document.getElementsByClassName("preview");
  if (previews.length > 0) {
    for(let i = previews.length - 1; i >= 0; i--) {
      previews[i].parentNode.removeChild(previews[i]);
    }
  }
  const images = document.getElementById("images");
  const number = images.files.length;
  for (i = 0; i < number; i++) {
    const urls = URL.createObjectURL(event.target.files[i]);
    const thumbnail = document.createElement("img");
    thumbnail.setAttribute("src", urls);
    thumbnail.setAttribute("class", "preview");
    document.getElementById("formFile").append(thumbnail);
  }
});