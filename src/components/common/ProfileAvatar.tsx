import type { ImgHTMLAttributes } from 'react';

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  src?: string | null;
}

export default function ProfileAvatar({ src, alt, ...props }: Props) {
  return <img {...props} alt={alt} src={src?.trim() || '/defaultUserProfile.png'} onError={event => {
    const image = event.currentTarget;
    if (image.getAttribute('src') !== '/defaultUserProfile.png') image.src = '/defaultUserProfile.png';
  }} />;
}
