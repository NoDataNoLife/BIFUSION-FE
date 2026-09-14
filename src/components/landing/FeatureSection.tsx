export default function FeatureSection() {
  return (
    <section className="w-full pt-[96px]">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-[#FFDEA8] px-5 py-2 text-[16px] leading-[20px] text-[#B27D29]">
          주요 기능
        </div>

        <h2 className="mt-4 font-hbios text-[48px] leading-[48px] text-[#101828]">
          의료 AI에 필요한 모든 것
        </h2>

        <p className="mt-4 font-hbios text-[20px] leading-[28px] text-[#4A5565]">
          의료 연구자와 의료 AI 개발자를 위해 특별히 설계된 강력한 기능
        </p>
      </div>

      {/* Card */}
      <div className="mt-16 flex justify-center">
        <img src="/card.png" alt="" className="h-auto max-w-full" />
      </div>
    </section>
  );
}
