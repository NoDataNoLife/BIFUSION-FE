import AugmentationRecipeForm from './AugmentationRecipeForm';
interface ShowcaseCreateFormProps {
  onClose: () => void;
  onCreated?: (recipeId?: number) => void;
  context?: 'COMMUNITY' | 'ASSET';
  initialSourceId?: number;
}
export default function ShowcaseCreateForm(props: ShowcaseCreateFormProps) {
  return <AugmentationRecipeForm {...props}/>;
}
