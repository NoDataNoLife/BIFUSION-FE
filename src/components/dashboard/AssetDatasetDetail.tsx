import DatasetDetailView from './DatasetDetailView';
interface Props { dataset: { id: string }; onBack: () => void; onDelete?: () => void; onUpdate?: (value: { name: string; description: string; tags: string[] }) => void }
export default function AssetDatasetDetail({ dataset, onBack }: Props) {
  return <DatasetDetailView datasetId={Number(dataset.id)} onBack={onBack}/>;
}
