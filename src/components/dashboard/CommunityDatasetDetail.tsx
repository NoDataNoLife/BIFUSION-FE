import DatasetDetailView from './DatasetDetailView';
interface Props { datasetPost: { datasetId: number }; onBack: () => void; onDelete?: () => void }
export default function CommunityDatasetDetail({ datasetPost, onBack }: Props) {
  return <DatasetDetailView datasetId={datasetPost.datasetId} onBack={onBack}/>;
}
