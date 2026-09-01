const logo = document.getElementById("crtLogo");

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function blinkLogo() {
  // 등장

  logo.style.opacity = "1";

  // 깜빡임 횟수

  const blinkCount = Math.floor(random(3, 8));

  let count = 0;

  const blinkInterval = setInterval(() => {
    logo.style.opacity = logo.style.opacity === "1" ? "0" : "1";

    count++;

    if (count >= blinkCount) {
      clearInterval(blinkInterval);

      logo.style.opacity = "1";

      // 유지시간

      const visibleTime = random(1000, 5000);

      setTimeout(() => {
        logo.style.opacity = "0";

        // 다음 등장 딜레이

        const nextDelay = random(2000, 10000);

        setTimeout(blinkLogo, nextDelay);
      }, visibleTime);
    }
  }, 120);
}

blinkLogo();
