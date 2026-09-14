import { useEffect, useRef, useState } from "react";

const cards = [
  {
    x: -1.0,
    rotate: -13,
    y: 78,
    title: "재현 가능한 결과",
    description: (
      <>
        정밀한 시드 제어로 일관되고
        <br />
        재현 가능한 합성 데이터 생성
        <br />
        을 보장하여 신뢰할 수 있는
        <br />
        연구 결과를 제공합니다.
      </>
    ),
  },
  {
    x: -0.6,
    rotate: -8,
    y: 34,
    title: "전문가 검증",
    description: (
      <>
        모든 합성 데이터는
        <br />
        의료 전문가가 검토하고 검증하여
        <br />
        임상적 정확성을 보장합니다.
      </>
    ),
  },
  {
    x: -0.2,
    rotate: -3,
    y: 5,
    title: "프라이버시 우선",
    description: (
      <>
        HIPAA 규정을 준수하며
        <br />
        로컬 실행 옵션을 제공합니다.
        <br />
        귀하의 데이터는 절대
        <br />
        외부로 유출되지 않습니다.
      </>
    ),
  },
  {
    x: 0.2,
    rotate: 3,
    y: 5,
    title: "빠른 생성",
    description: (
      <>
        최적화된 AI 모델로
        <br />
        몇 분 안에 수천 개의 합성 샘플을
        <br />
        생성할 수 있습니다.
      </>
    ),
  },
  {
    x: 0.6,
    rotate: 8,
    y: 34,
    title: "다양한 포맷",
    description: (
      <>
        영상, 전자건강기록, 유전체학,
        <br />
        임상 노트 등 다양한 의료
        <br />
        데이터 유형을 지원합니다.
      </>
    ),
  },
  {
    x: 1.0,
    rotate: 13,
    y: 78,
    title: "API 통합",
    description: (
      <>
        REST API 및 SDK를 통해
        <br />
        기존 워크플로우와 원활하게
        <br />
        통합할 수 있습니다.
      </>
    ),
  },
];

export default function FeatureCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);

  // 클릭한 카드가 중앙으로 이동하는 정도
  const selectedProgressRef = useRef<number[]>(cards.map(() => 0));

  // animation loop에서 최신 selectedIndex를 읽기 위한 ref
  const selectedIndexRef = useRef<number | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // selectedIndex가 바뀔 때 ref도 최신 상태로 유지
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    let frameId = 0;

    const updateTarget = () => {
      if (!sectionRef.current) return;

      const parentSection = sectionRef.current.closest("section");

      if (!parentSection) return;

      const rect = parentSection.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;

      const sectionCenter = rect.top + rect.height / 2;

      const start = window.innerHeight * 0.95;
      const end = viewportCenter;

      let progress = (start - sectionCenter) / (start - end);

      progress = Math.max(0, Math.min(1, progress));

      targetProgressRef.current = progress;
    };

    const animate = () => {
      progressRef.current +=
        (targetProgressRef.current - progressRef.current) * 0.1;

      const progress = progressRef.current;

      const eased = -(Math.cos(Math.PI * progress) - 1) / 2;

      const spread = 400;

      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        const config = cards[index];

        // 기존 fan 위치
        const x = config.x * spread * eased;
        const y = config.y * eased;
        const rotate = config.rotate * eased;

        // 현재 선택된 카드인지 확인
        const isSelected = selectedIndexRef.current === index;

        // 선택됨 → 1
        // 선택 해제 → 0
        const targetSelected = isSelected ? 1 : 0;

        // 중앙 이동 애니메이션
        selectedProgressRef.current[index] +=
          (targetSelected - selectedProgressRef.current[index]) * 0.12;

        const selectedProgress = selectedProgressRef.current[index];

        // fan 위치 → 중앙 위치
        const finalX = x * (1 - selectedProgress);
        const finalY = y * (1 - selectedProgress);
        const finalRotate = rotate * (1 - selectedProgress);

        card.style.transform = `
          translate(-50%, -50%)
          translate3d(${finalX}px, ${finalY}px, 0)
          rotate(${finalRotate}deg)
        `;
      });

      frameId = requestAnimationFrame(animate);
    };

    window.addEventListener("scroll", updateTarget, {
      passive: true,
    });

    window.addEventListener("resize", updateTarget);

    updateTarget();

    frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);

      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative mt-10 h-[430px] w-full max-w-[1000px]"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {cards.map((card, index) => (
          <div
            key={index}
            ref={(el) => {
              cardsRef.current[index] = el;
            }}
            className="group absolute left-1/2 top-1/2 cursor-pointer"
            style={{
              // Hover만 했을 때는 기존 카드 순서 유지
              // Click해서 중앙에 나온 카드만 최상단
              zIndex: selectedIndex === index ? 100 : [1, 3, 5, 6, 4, 2][index],
              perspective: "1200px",
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => {
              // 이미 선택된 카드를 다시 클릭하면
              // 중앙 → 원래 fan 위치
              if (selectedIndex === index) {
                setSelectedIndex(null);
              } else {
                // 새로운 카드를 클릭하면
                // 해당 카드가 중앙으로 이동
                setSelectedIndex(index);
              }
            }}
          >
            {/* =================================
                Hover 시 원래 자리에서 위로 빼꼼
            ================================== */}
            <div
              className={`
                transition-transform
                duration-300
                ease-out
                ${
                  hoveredIndex === index && selectedIndex !== index
                    ? "-translate-y-[35px]"
                    : "translate-y-0"
                }
              `}
            >
              {/* =================================
                  실제 카드 + Flip
              ================================== */}
              <div
                className={`
                  relative
                  h-[340px]
                  w-[230px]
                  [transform-style:preserve-3d]
                  transition-transform
                  duration-500
                  ease-in-out
                  ${
                    hoveredIndex === index || selectedIndex === index
                      ? "[transform:rotateY(180deg)]"
                      : "[transform:rotateY(0deg)]"
                  }
                `}
              >
                {/* =========================
                    앞면
                ========================== */}
                <div
                  className="
                    absolute
                    inset-0
                    overflow-hidden
                    rounded-3xl
                    [backface-visibility:hidden]
                  "
                >
                  <img
                    src="/card.png"
                    alt=""
                    className="block h-full w-full object-fill"
                  />
                </div>

                {/* =========================
                    뒷면
                ========================== */}
                <div
                  className="
                    absolute
                    inset-0
                    overflow-hidden
                    rounded-3xl
                    bg-white
                    shadow-[0_8px_30px_rgba(0,0,0,0.18)]
                    [backface-visibility:hidden]
                    [transform:rotateY(180deg)]
                  "
                >
                  {/* Hover Icon */}
                  <img
                    src={`/hover_icon${index + 1}.png`}
                    alt=""
                    className="
                      absolute
                      left-1/2
                      top-[20%]
                      h-[64px]
                      w-[64px]
                      -translate-x-1/2
                      object-contain
                    "
                  />

                  {/* 제목 */}
                  <h3
                    className="
                      absolute
                      left-0
                      right-0
                      top-[46%]
                      px-4
                      text-center
                      text-[22px]
                      font-bold
                      leading-[28px]
                      text-[#101828]
                    "
                  >
                    {card.title}
                  </h3>

                  {/* 설명 */}
                  <p
                    className="
                      absolute
                      left-0
                      right-0
                      top-[56%]
                      px-5
                      text-center
                      leading-[21px]
                      text-[#667085]
                    "
                    style={{
                      fontSize: index === 1 || index === 3 ? "12.5px" : "13px",
                    }}
                  >
                    {card.description}
                  </p>

                  {/* 하단 로고
                      카드 하단 중앙에 고정 */}
                  <img
                    src="/logo1.png"
                    alt=""
                    className="
                      absolute
                      bottom-[18px]
                      left-1/2
                      w-[16px]
                      -translate-x-1/2
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
