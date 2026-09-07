import { useEffect, useRef } from "react";

const cards = [
  { x: -1, rotate: -12, y: 70 },
  { x: -0.6, rotate: -7, y: 30 },
  { x: -0.2, rotate: -3, y: 10 },
  { x: 0.2, rotate: 3, y: 10 },
  { x: 0.6, rotate: 7, y: 30 },
  { x: 1, rotate: 12, y: 70 },
];

export default function FeatureCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    let frameId = 0;

    const updateCards = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // 섹션이 화면에 들어오기 시작한 지점부터
      // 카드가 펼쳐지기 시작하도록 계산
      const start = viewportHeight * 0.7;
      const end = viewportHeight * 0.1;

      let progress = (start - rect.top) / (start - end);

      progress = Math.max(0, Math.min(1, progress));

      // 부드러운 easing
      const eased = progress * progress * (3 - 2 * progress);

      const spread = 500;

      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        const config = cards[index];

        const x = config.x * spread * eased;
        const y = config.y * (1 - eased);
        const rotate = config.rotate * eased;

        card.style.transform = `
          translate3d(${x}px, ${y}px, 0)
          rotate(${rotate}deg)
        `;
      });

      frameId = requestAnimationFrame(updateCards);
    };

    frameId = requestAnimationFrame(updateCards);

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div ref={sectionRef} className="relative h-[140vh] w-full">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div className="relative h-[620px] w-full max-w-[1200px]">
          {cards.map((_, index) => (
            <img
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              src="/card.png"
              alt=""
              className="absolute left-1/2 top-1/2 w-[280px] -translate-x-1/2 -translate-y-1/2 will-change-transform"
              style={{
                zIndex: index,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
