const scrollToTop = document.querySelector("#scrollToTopBtn");

if (scrollToTop) {
  scrollToTop.style.display = "none";
  document.addEventListener("scroll", (e) => {
    if (document.documentElement.scrollTop <= 50) {
      scrollToTop.style.display = "none";
    } else {
      scrollToTop.style.display = "block";
    }
  });

  scrollToTop.addEventListener('click', () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  })
};