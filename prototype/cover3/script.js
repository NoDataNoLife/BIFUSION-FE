const logo = document.getElementById("movingLogo");

const cover = document.querySelector(".cover");

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function startAnimation() {
  const coverWidth = cover.clientWidth;

  const coverHeight = cover.clientHeight;

  const logoWidth = logo.offsetWidth;

  const logoHeight = logo.offsetHeight;

  let x = -logoWidth;

  const centerY = (coverHeight - logoHeight) / 2;

  logo.style.top = centerY + "px";

  logo.style.opacity = "1";

  const speed = random(0.8, 1.5);

  function move() {
    x += speed;

    logo.style.left = x + "px";

    if (x < coverWidth) {
      requestAnimationFrame(move);
    } else {
      logo.style.opacity = "0";

      const delay = random(2000, 8000);

      setTimeout(startAnimation, delay);
    }
  }

  move();
}

startAnimation();
