import { useEffect, useId, useRef } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { maxLength: number };
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { maxLength: number };

export function LimitedInput(props: InputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const id = useId();
  const length = String(props.value ?? '').length;
  const exceeded = length > props.maxLength;
  useEffect(() => { ref.current?.setCustomValidity(exceeded ? `최대 ${props.maxLength}자까지 입력할 수 있습니다.` : ''); }, [exceeded, props.maxLength]);
  return <span className="flex min-w-0 flex-1 flex-col"><input {...props} ref={ref} aria-describedby={[props['aria-describedby'], id].filter(Boolean).join(' ')} aria-invalid={exceeded || props['aria-invalid']} /><span id={id} className={`block text-right text-xs tabular-nums ${exceeded ? 'text-red-500' : 'text-muted-foreground'}`}>{length.toLocaleString()} / {props.maxLength.toLocaleString()}자{exceeded && ' · 길이를 줄여 주세요'}</span></span>;
}

export function LimitedTextarea(props: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  const length = String(props.value ?? '').length;
  const exceeded = length > props.maxLength;
  useEffect(() => { ref.current?.setCustomValidity(exceeded ? `최대 ${props.maxLength}자까지 입력할 수 있습니다.` : ''); }, [exceeded, props.maxLength]);
  return <span className="flex min-w-0 flex-1 flex-col"><textarea {...props} ref={ref} aria-describedby={[props['aria-describedby'], id].filter(Boolean).join(' ')} aria-invalid={exceeded || props['aria-invalid']} /><span id={id} className={`block text-right text-xs tabular-nums ${exceeded ? 'text-red-500' : 'text-muted-foreground'}`}>{length.toLocaleString()} / {props.maxLength.toLocaleString()}자{exceeded && ' · 길이를 줄여 주세요'}</span></span>;
}
