import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  FolderPlus,
} from 'lucide-react';

import '../../components/jobs/AISetup.css';

import api from '../../lib/axios';
import { getJobErrorMessage, useJobStore } from '../../store/useJobStore';

interface AugmentedDataset {
  datasetId: number | string;
  id?: number | string;
  name?: string;
  jobCode?: string;
  sampleCount?: number;
  totalSampleCount?: number;
  generatedCount?: number;
  createdAt?: string;
}

export default function TrainSetupPage() {
  const { projectId, jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { createJob, isLoading } = useJobStore();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [datasets, setDatasets] = useState<AugmentedDataset[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [datasetError, setDatasetError] = useState<string | null>(null);

  const initialDatasetId = location.state?.datasetId ? String(location.state.datasetId) : '';
  const [selectedAugmentData, setSelectedAugmentData] = useState<string>(initialDatasetId);
  const [kShot, setKShot] = useState<1 | 3 | 5 | 10>(5);
  const [epochs, setEpochs] = useState('30');
  const [qQuery, setQQuery] = useState('5');
  const [episodesPerEpoch, setEpisodesPerEpoch] = useState('10');
  const [seed, setSeed] = useState('42');

  useEffect(() => {
    if (!projectId) return;
    let isMounted = true;
    const fetchDatasets = async () => {
      try {
        setLoadingDatasets(true);
        setDatasetError(null);
        const res = await api.get(`/projects/${projectId}/augmented-datasets`);
        const data = (res.data?.data ?? res.data) as AugmentedDataset[];
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setDatasets(list);
          if (list.length > 0 && !selectedAugmentData) {
            const matched = initialDatasetId
              ? list.find((d) => String(d.datasetId ?? d.id) === initialDatasetId)
              : null;
            setSelectedAugmentData(matched ? String(matched.datasetId ?? matched.id) : String(list[0].datasetId ?? list[0].id));
          }
        }
      } catch (err) {
        if (isMounted) {
          setDatasetError(getJobErrorMessage(err, '증강 데이터셋 목록을 불러오지 못했습니다.'));
        }
      } finally {
        if (isMounted) {
          setLoadingDatasets(false);
        }
      }
    };
    fetchDatasets();
    return () => { isMounted = false; };
  }, [projectId, initialDatasetId]);

  const numEpochs = Number(epochs);
  const numQuery = Number(qQuery);
  const numEpisodes = Number(episodesPerEpoch);
  const numSeed = Number(seed);

  const isValid = !!projectId && !!selectedAugmentData
    && Number.isInteger(numEpochs) && numEpochs >= 1 && numEpochs <= 200
    && Number.isInteger(numQuery) && numQuery >= 1 && numQuery <= 20
    && Number.isInteger(numEpisodes) && numEpisodes >= 1 && numEpisodes <= 100
    && Number.isInteger(numSeed) && numSeed >= 0 && numSeed <= 4294967295;

  const handleStartTrain = async () => {
    if (isLoading || !isValid || !projectId) return;
    setSubmitError(null);
    try {
      const parsedDatasetId = isNaN(Number(selectedAugmentData))
        ? selectedAugmentData
        : Number(selectedAugmentData);

      const job = await createJob(projectId, 'TRAINING', {
        dataset_id: parsedDatasetId,
        k_shot: kShot,
        epochs: numEpochs,
        q_query: numQuery,
        episodes_per_epoch: numEpisodes,
        seed: numSeed,
      });

      navigate(`/dashboard/projects/${projectId}/train/${job.jobId}/progress`);
    } catch (err) {
      setSubmitError(getJobErrorMessage(err, '학습 요청에 실패했습니다. 다시 시도해 주세요.'));
    }
  };

  return (
    <div className="ai-setup min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center gap-4">
          <button
            aria-label="프로젝트로 돌아가기"
            onClick={() => navigate(`/dashboard/projects/${projectId}`)}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
              <span>Project</span>
              <ChevronRight className="w-3 h-3" />
              <span>{jobId === 'new' ? 'New Job' : `Job ${jobId}`}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary font-semibold italic">Train Setup</span>
            </nav>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">모델 학습 설정</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">
        {submitError && (
          <p role="alert" className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-sm font-medium">
            {submitError}
          </p>
        )}

        <div className="bg-card rounded-3xl border border-border shadow-sm p-6 md:p-8 space-y-7">
          <p className="text-muted-foreground font-medium text-sm leading-relaxed">
            Few-Shot Learning(소수의 참고 이미지로 구분하는 방식) 모델을 학습합니다. 연습용 이미지도 선택한 증강 데이터셋 안에서 자동으로 구성되므로 별도 이미지 업로드가 필요하지 않습니다.
          </p>

          {/* Augment Data Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-foreground uppercase tracking-wide">
                증강 데이터 선택 <span className="text-red-500">*</span>
              </label>
              {loadingDatasets && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> 데이터셋 조회 중…
                </span>
              )}
            </div>

            {datasetError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-500">
                {datasetError}
              </div>
            )}

            {!loadingDatasets && datasets.length === 0 ? (
              <div className="p-6 bg-muted/40 border border-dashed border-border rounded-2xl text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-orange-500 mx-auto" />
                <p className="text-sm font-bold text-foreground">사용 가능한 증강 데이터셋이 없습니다</p>
                <p className="text-xs text-muted-foreground">
                  모델 학습을 진행하려면 먼저 정상·비정상 이미지를 등록하여 데이터 증강을 1회 이상 완료해야 합니다.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/projects/${projectId}/jobs/new/setup`)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                >
                  <FolderPlus size={16} /> 데이터 증강 시작하기
                </button>
              </div>
            ) : (
              <select
                value={selectedAugmentData}
                disabled={loadingDatasets || datasets.length === 0}
                onChange={(e) => setSelectedAugmentData(e.target.value)}
                className="w-full px-5 py-4 bg-muted border border-border rounded-2xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer text-sm disabled:opacity-50"
              >
                <option value="">증강 완료된 데이터를 선택하세요</option>
                {datasets.map((d) => {
                  const id = String(d.datasetId ?? d.id);
                  const count = d.totalSampleCount ?? d.sampleCount ?? d.generatedCount ?? '-';
                  const dateStr = d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '';
                  return (
                    <option key={id} value={id}>
                      {d.name || d.jobCode || `데이터셋 #${id}`} ({count}장{dateStr ? `, ${dateStr}` : ''})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* K-shot Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-foreground uppercase tracking-wide">
              K-shot <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {[1, 3, 5, 10].map((shot) => (
                <button
                  key={shot}
                  type="button"
                  onClick={() => setKShot(shot as 1 | 3 | 5 | 10)}
                  className={`flex-1 py-4 rounded-2xl font-semibold text-sm transition-all border-2 cursor-pointer ${
                    kShot === shot
                      ? 'bg-primary/10 border-primary text-primary shadow-sm'
                      : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {shot}-shot
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              학습 사례마다 정상·비정상 각각 {kShot}장의 Support(참고 이미지)를 사용합니다.
            </p>
          </div>

          <div className="space-y-3">
            <label htmlFor="train-epochs" className="block text-sm font-semibold">
              Epoch · 학습 반복 횟수 (1~200회)
            </label>
            <input
              id="train-epochs"
              type="number"
              min="1"
              max="200"
              step="1"
              value={epochs}
              onChange={(e) => setEpochs(e.target.value)}
              className="w-full px-5 py-4 bg-muted border border-border rounded-2xl text-foreground text-sm font-medium"
            />
            <div className="flex flex-wrap gap-2">
              {['10', '30', '50'].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setEpochs(value)}
                  className={`ai-preset ${epochs === value ? 'is-selected' : ''}`}
                >
                  {value}회{value === '30' ? ' · 기본' : ''}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              학습 사례를 묶어서 반복하는 큰 단위입니다. 기본값은 30이며, 늘리면 학습 시간이 길어질 수 있습니다.
            </p>
          </div>

          <details className="ai-advanced" open>
            <summary className="font-bold cursor-pointer text-sm">고급 설정 · 처음에는 기본값을 사용하세요</summary>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label htmlFor="train-query" className="block text-sm font-semibold">
                  Q-query · 종류별 연습 이미지 수 (1~20장)
                </label>
                <input
                  id="train-query"
                  type="number"
                  min="1"
                  max="20"
                  step="1"
                  value={qQuery}
                  onChange={(e) => setQQuery(e.target.value)}
                  className="w-full px-5 py-4 bg-muted border border-border rounded-2xl text-foreground text-sm font-medium"
                />
                <p className="text-xs text-muted-foreground">
                  한 학습 사례에서 정상·비정상 각각 몇 장을 분류하며 연습할지 정합니다. (기본 5장)
                </p>
              </div>

              <div className="space-y-3">
                <label htmlFor="train-episodes" className="block text-sm font-semibold">
                  에포크당 에피소드 수 (1~100)
                </label>
                <input
                  id="train-episodes"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={episodesPerEpoch}
                  onChange={(e) => setEpisodesPerEpoch(e.target.value)}
                  className="w-full px-5 py-4 bg-muted border border-border rounded-2xl text-foreground text-sm font-medium"
                />
                <p className="text-xs text-muted-foreground">
                  한 Epoch 안에서 참고 이미지와 연습 이미지로 구성한 학습 사례를 몇 번 만들지 정합니다. (기본 10)
                </p>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label htmlFor="train-seed" className="block text-sm font-semibold">
                  Seed · 학습 시드 (0~4294967295)
                </label>
                <input
                  id="train-seed"
                  type="number"
                  min="0"
                  max="4294967295"
                  step="1"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className="w-full px-5 py-4 bg-muted border border-border rounded-2xl text-foreground text-sm font-medium"
                />
                <p className="text-xs text-muted-foreground">
                  이미지 추출 등의 무작위 계산 시작값입니다. 같은 조건에서 결과를 재현하는 데 도움이 되며 기본값은 42입니다.
                </p>
              </div>
            </div>
          </details>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
              className="px-8 py-4 bg-muted text-muted-foreground rounded-2xl font-semibold text-sm hover:text-foreground transition-all cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleStartTrain}
              disabled={!isValid || isLoading || loadingDatasets}
              className={`px-10 py-4 rounded-2xl font-semibold text-sm transition-all shadow-lg active:scale-95 cursor-pointer ${
                isValid && !isLoading && !loadingDatasets
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                  : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none opacity-50'
              }`}
            >
              {isLoading ? '학습 시작 중...' : '학습 시작하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
