console.log("script loaded");

const scenes = [
  {
    cover: document.getElementById("lightCover"),
    logo: document.getElementById("lightLogo1"),
    ant: document.getElementById("lightAnt"),
    dark: false,
  },

  {
    cover: document.getElementById("darkCover"),
    logo: document.getElementById("darkLogo1"),
    ant: document.getElementById("darkAnt"),
    dark: true,
  },
];

scenes.forEach(startScene);

function startScene(scene) {
  const coverWidth = scene.cover.clientWidth;
  const coverHeight = scene.cover.clientHeight;

  const logo = scene.logo;
  const ant = scene.ant;

  // CRT 로고만 살짝 크게
  if (scene.dark) {
    logo.style.width = "160px";
  }

  // ------------------------
  // LOGO
  // ------------------------

  let logoX = 100;
  let logoY = 100;

  let logoDX = 0.6;
  let logoDY = 0.6;

  // ------------------------
  // ANT
  // ------------------------

  let antState = null;

  function spawnAnt() {
    const leftToRight = Math.random() > 0.5;

    antState = {
      x: leftToRight ? -100 : coverWidth + 100,

      y: Math.random() * (coverHeight - 120),

      speed: 0.4 + Math.random() * 0.8,

      direction: leftToRight ? 1 : -1,
    };

    ant.style.opacity = "1";

    ant.style.transform = leftToRight ? "scaleX(1)" : "scaleX(-1)";
  }

  spawnAnt();

  // ------------------------
  // LOOP
  // ------------------------

  function animate() {
    // LOGO

    const logoWidth = logo.offsetWidth;
    const logoHeight = logo.offsetHeight;

    logoX += logoDX;
    logoY += logoDY;

    if (logoX <= 0) {
      logoX = 0;
      logoDX *= -1;
    }

    if (logoX >= coverWidth - logoWidth) {
      logoX = coverWidth - logoWidth;
      logoDX *= -1;
    }

    if (logoY <= 0) {
      logoY = 0;
      logoDY *= -1;
    }

    if (logoY >= coverHeight - logoHeight) {
      logoY = coverHeight - logoHeight;
      logoDY *= -1;
    }

    logo.style.left = logoX + "px";
    logo.style.top = logoY + "px";

    // ANT

    antState.x += antState.speed * antState.direction;

    ant.style.left = antState.x + "px";

    ant.style.top = antState.y + "px";

    const outOfScreen = antState.x < -150 || antState.x > coverWidth + 150;

    if (outOfScreen) {
      ant.style.opacity = "0";

      const delay = 1000 + Math.random() * 5000;

      setTimeout(() => {
        spawnAnt();
      }, delay);
    }

    requestAnimationFrame(animate);
  }

  animate();
}
