import { useEffect, useRef, useState } from "react";

type CoverType = 1 | 2 | 3 | 4;

export default function HeroCover() {
  const [cover, setCover] = useState<CoverType>(() => {
    const previousCover = sessionStorage.getItem("bifusion-last-cover");

    let nextCover: CoverType;

    do {
      nextCover = (Math.floor(Math.random() * 4) + 1) as CoverType;
    } while (previousCover && Number(previousCover) === nextCover);

    sessionStorage.setItem("bifusion-last-cover", String(nextCover));

    return nextCover;
  });

  const handleCoverChange = () => {
    setCover((prev) => {
      let nextCover: CoverType;

      do {
        nextCover = (Math.floor(Math.random() * 4) + 1) as CoverType;
      } while (nextCover === prev);

      sessionStorage.setItem("bifusion-last-cover", String(nextCover));

      return nextCover;
    });
  };

  return (
    <div
      onClick={handleCoverChange}
      className="relative w-full h-full min-h-[340px] lg:min-h-[640px] overflow-hidden rounded-3xl cursor-pointer"
    >
      {cover === 1 && <Cover1 />}
      {cover === 2 && <Cover2 />}
      {cover === 3 && <Cover3 />}
      {cover === 4 && <Cover4 />}
    </div>
  );
}

/* =========================================================
   COVER 1
   ========================================================= */

function Cover1() {
  const logoRef = useRef<HTMLImageElement>(null);
  const antRef = useRef<HTMLImageElement>(null);

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = document.documentElement.classList.contains("dark");
    setIsDark(darkMode);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const logo = logoRef.current;
    const ant = antRef.current;

    if (!logo || !ant) return;

    let animationId: number;

    let logoX = 100;
    let logoY = 100;

    let logoDX = 0.6;
    let logoDY = 0.6;

    let antX = 0;
    let antY = 0;
    let antSpeed = 0;
    let antDirection = 1;

    let antTimeout: ReturnType<typeof setTimeout> | null = null;

    const spawnAnt = () => {
      const width = ant.parentElement?.clientWidth ?? 450;
      const height = ant.parentElement?.clientHeight ?? 600;

      const leftToRight = Math.random() > 0.5;

      antX = leftToRight ? -100 : width + 100;
      antY = Math.random() * Math.max(0, height - 120);
      antSpeed = 0.4 + Math.random() * 0.8;
      antDirection = leftToRight ? 1 : -1;

      ant.style.opacity = "1";
      ant.style.transform = leftToRight ? "scaleX(1)" : "scaleX(-1)";
    };

    spawnAnt();

    const animate = () => {
      const container = logo.parentElement;

      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      const logoWidth = logo.offsetWidth;
      const logoHeight = logo.offsetHeight;

      logoX += logoDX;
      logoY += logoDY;

      if (logoX <= 0) {
        logoX = 0;
        logoDX *= -1;
      }

      if (logoX >= width - logoWidth) {
        logoX = width - logoWidth;
        logoDX *= -1;
      }

      if (logoY <= 0) {
        logoY = 0;
        logoDY *= -1;
      }

      if (logoY >= height - logoHeight) {
        logoY = height - logoHeight;
        logoDY *= -1;
      }

      logo.style.left = `${logoX}px`;
      logo.style.top = `${logoY}px`;

      antX += antSpeed * antDirection;

      ant.style.left = `${antX}px`;
      ant.style.top = `${antY}px`;

      const outOfScreen = antX < -150 || antX > width + 150;

      if (outOfScreen) {
        ant.style.opacity = "0";

        const delay = 1000 + Math.random() * 5000;

        antTimeout = setTimeout(() => {
          spawnAnt();
        }, delay);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);

      if (antTimeout) {
        clearTimeout(antTimeout);
      }
    };
  }, []);

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${
        isDark ? "bg-[#1d222c]" : "bg-[#f5f5f5]"
      }`}
    >
      <img
        ref={logoRef}
        src={isDark ? "/logo_crt_nowhite.png" : "/logo_og.png"}
        alt=""
        className="absolute w-[160px] h-auto select-none pointer-events-none"
      />

      <img
        ref={antRef}
        src="/ant.png"
        alt=""
        className="absolute w-[55px] h-auto select-none pointer-events-none"
      />
    </div>
  );
}

/* =========================================================
   COVER 2
   ========================================================= */

function Cover2() {
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const logo = logoRef.current;

    if (!logo) return;

    let blinkInterval: ReturnType<typeof setInterval> | null = null;
    let visibleTimeout: ReturnType<typeof setTimeout> | null = null;
    let nextTimeout: ReturnType<typeof setTimeout> | null = null;

    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const blinkLogo = () => {
      logo.style.opacity = "1";

      const blinkCount = Math.floor(random(3, 8));

      let count = 0;

      blinkInterval = setInterval(() => {
        logo.style.opacity = logo.style.opacity === "1" ? "0" : "1";

        count++;

        if (count >= blinkCount) {
          if (blinkInterval) {
            clearInterval(blinkInterval);
          }

          logo.style.opacity = "1";

          const visibleTime = random(1000, 5000);

          visibleTimeout = setTimeout(() => {
            logo.style.opacity = "0";

            const nextDelay = random(2000, 10000);

            nextTimeout = setTimeout(() => {
              blinkLogo();
            }, nextDelay);
          }, visibleTime);
        }
      }, 120);
    };

    const firstDelay = random(1000, 6000);

    nextTimeout = setTimeout(() => {
      blinkLogo();
    }, firstDelay);

    return () => {
      if (blinkInterval) clearInterval(blinkInterval);
      if (visibleTimeout) clearTimeout(visibleTimeout);
      if (nextTimeout) clearTimeout(nextTimeout);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src="/cover2.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      <img
        ref={logoRef}
        src="/logo_crt.png"
        alt=""
        className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[120px] h-auto pointer-events-none z-10"
        style={{ opacity: 0.5 }}
      />
    </div>
  );
}

/* =========================================================
   COVER 3
   ========================================================= */

function Cover3() {
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const logo = logoRef.current;

    if (!logo) return;

    let animationId: number;
    let restartTimeout: ReturnType<typeof setTimeout> | null = null;

    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const startAnimation = () => {
      const container = logo.parentElement;

      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      const logoWidth = logo.offsetWidth;
      const logoHeight = logo.offsetHeight;

      let x = -logoWidth;

      const centerY = (height - logoHeight) / 2;

      logo.style.top = `${centerY}px`;
      logo.style.left = `${x}px`;
      logo.style.opacity = "1";

      const speed = random(0.8, 1.5);

      const move = () => {
        x += speed;

        logo.style.left = `${x}px`;

        if (x < width) {
          animationId = requestAnimationFrame(move);
        } else {
          logo.style.opacity = "0";

          const delay = random(2000, 8000);

          restartTimeout = setTimeout(() => {
            startAnimation();
          }, delay);
        }
      };

      move();
    };

    const firstDelay = random(1000, 5000);

    restartTimeout = setTimeout(() => {
      startAnimation();
    }, firstDelay);

    return () => {
      cancelAnimationFrame(animationId);

      if (restartTimeout) {
        clearTimeout(restartTimeout);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src="/cover3.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      <img
        ref={logoRef}
        src="/logo_stippling.png"
        alt=""
        className="absolute w-[39.5%] h-auto opacity-0 pointer-events-none"
      />
    </div>
  );
}

/* =========================================================
   COVER 4
   ========================================================= */

function Cover4() {
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const logo = logoRef.current;

    if (!logo) return;

    let timeout1: ReturnType<typeof setTimeout> | null = null;
    let timeout2: ReturnType<typeof setTimeout> | null = null;
    let timeout3: ReturnType<typeof setTimeout> | null = null;
    let restartTimeout: ReturnType<typeof setTimeout> | null = null;

    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const runAnimation = () => {
      const sizes = [
        140 + random(-15, 15),
        230 + random(-25, 25),
        430 + random(-40, 40),
      ];

      logo.style.opacity = "1";
      logo.style.width = `${sizes[0]}px`;

      timeout1 = setTimeout(() => {
        logo.style.width = `${sizes[1]}px`;
      }, 400);

      timeout2 = setTimeout(() => {
        logo.style.width = `${sizes[2]}px`;
      }, 800);

      timeout3 = setTimeout(() => {
        logo.style.opacity = "0";

        const delay = random(2000, 7000);

        restartTimeout = setTimeout(() => {
          runAnimation();
        }, delay);
      }, 1800);
    };

    const firstDelay = random(1000, 5000);

    restartTimeout = setTimeout(() => {
      runAnimation();
    }, firstDelay);

    return () => {
      if (timeout1) clearTimeout(timeout1);
      if (timeout2) clearTimeout(timeout2);
      if (timeout3) clearTimeout(timeout3);
      if (restartTimeout) clearTimeout(restartTimeout);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-visible">
      <img
        src="/cover4.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      <img
        ref={logoRef}
        src="/logo_dots.png"
        alt=""
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[31%] h-auto pointer-events-none"
        style={{
          opacity: 0,
          filter: "opacity(30%)",
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}
