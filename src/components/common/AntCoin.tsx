/** Shared decorative currency mark. Keep the amount and unit in adjacent text. */
export default function AntCoin({ className = 'w-6 h-6' }: { className?: string }) {
  return <img src="/coin_ant.png" alt="" aria-hidden="true" className={`shrink-0 object-contain ${className}`} />;
}
