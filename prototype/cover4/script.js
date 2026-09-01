const logo = document.getElementById("dotsLogo");

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function runAnimation() {
  const sizes = [
    140 + random(-15, 15),

    230 + random(-25, 25),

    430 + random(-40, 40),
  ];

  logo.style.opacity = "1";

  logo.style.width = sizes[0] + "px";

  setTimeout(() => {
    logo.style.width = sizes[1] + "px";
  }, 400);

  setTimeout(() => {
    logo.style.width = sizes[2] + "px";
  }, 800);

  setTimeout(() => {
    logo.style.opacity = "0";

    const delay = random(2000, 7000);

    setTimeout(runAnimation, delay);
  }, 1800);
}

runAnimation();
