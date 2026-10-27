import { Link } from 'react-router-dom';
export interface ForkOrigin { recipeId: number; title: string; authorNickname: string; isDeleted: boolean }
export default function RecipeOrigin({ origin }: { origin?: ForkOrigin | null }) {
  if (!origin) return null;
  return <p className="text-xs leading-6 text-muted-foreground">원본 · {origin.isDeleted ? <span>{origin.title} (삭제됨)</span> : <Link className="text-primary underline" to={`/dashboard/community?recipeId=${origin.recipeId}`}>{origin.title}</Link>} · {origin.authorNickname}</p>;
}
