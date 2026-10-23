import { Star } from 'lucide-react';

interface Props { value: number; onChange?: (value: number) => void; disabled?: boolean; label?: string }
export default function StarRating({ value, onChange, disabled, label = '평점' }: Props) {
  return <div className="flex items-center gap-1" role={onChange ? 'group' : 'img'} aria-label={`${label}: ${value}점 / 5점`}>
    {[1, 2, 3, 4, 5].map(score => onChange
      ? <button key={score} type="button" aria-label={`${label} ${score}점`} aria-pressed={value === score} disabled={disabled} onClick={() => onChange(score)}
          className="rounded-lg p-2 text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50">
          <Star size={24} fill={score <= value ? 'currentColor' : 'none'} className={score <= value ? '' : 'text-muted-foreground/40'} />
        </button>
      : <Star key={score} aria-hidden="true" size={15} fill={score <= value ? 'currentColor' : 'none'} className={score <= value ? 'text-primary' : 'text-muted-foreground/40'} />)}
    <span aria-hidden="true" className="ml-2 text-sm text-muted-foreground">{value ? `${value} / 5` : '별점을 선택해 주세요'}</span>
  </div>;
}
