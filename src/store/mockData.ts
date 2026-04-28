export interface Recipe {
  id: string; // API의 recipeId와 매칭
  title: string;
  description: string;
  author: string;
  authorAvatar: string; // UI 유지용
  thumbnailUrl: string;
  createdAt: string;
  rating: number;
  reviewCount: number;
  forkedCount: number;
  viewCount: number;
  downloadCount: number;
  isExpertVerified: boolean;
  isFavorited: boolean;
  forkedFrom?: {
    originalRecipeId: number;
    title: string;
  };
  overview: {
    content: string;
    features: string[];
    recommendations: string[];
  };
  settings: {
    model: string;
    steps: number;
    sampler: string;
    cfgScale: number;
    seed: string;
    resolution: string;
    batchSize: number;
  };
}

export const ALL_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Lung Cancer High-Res Enhancement',
    description: '폐암 진단 데이터셋을 위한 해상도 개선 및 노이즈 제거 레시피',
    author: '이민지',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lee',
    thumbnailUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80',
    createdAt: '2025-02-01T00:00:00',
    rating: 4.5,
    reviewCount: 89,
    forkedCount: 32,
    viewCount: 450,
    downloadCount: 120,
    isExpertVerified: true,
    isFavorited: false,
    overview: {
      content: '이 레시피는 폐암 진단용 CT 영상의 노이즈를 억제하고 결절(Nodule)의 경계를 명확하게 만드는데 특화되어 있습니다.',
      features: [
        '의료 특화 초해상도 알고리즘 적용',
        '미세 결절 보존 필터링',
        'DICOM 호환성 검증 완료'
      ],
      recommendations: [
        'CT 영상 화질 개선',
        '결절 자동 검출 전처리',
        '방사선사 판독 보조용'
      ]
    },
    settings: {
      model: 'Stable Diffusion XL',
      steps: 50,
      sampler: 'DPM++ 2M Karras',
      cfgScale: 7.5,
      seed: 'Random',
      resolution: '1024x1024',
      batchSize: 4
    }
  },
  {
    id: '2',
    title: '심장 질환 예측 모델 최적화 (Heart Disease)',
    description: 'ECG 데이터 증강을 위한 고성능 레시피. FID Score 12.3 달성',
    author: '김성한',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    createdAt: '2025-01-15T00:00:00',
    rating: 4.8,
    reviewCount: 127,
    forkedCount: 45,
    viewCount: 892,
    downloadCount: 340,
    isExpertVerified: true,
    isFavorited: true,
    overview: {
      content: 'ECG 신호 데이터의 시간적 특성을 보존하면서 데이터 불균형 문제를 해결하기 위한 증강 파이프라인입니다.',
      features: [
        'FID Score 12.3 달성',
        '심전도 파형 왜곡 방지 로직',
        '실시간 배치 생성 지원'
      ],
      recommendations: [
        '심전도 분류 모델 학습',
        '희귀 부정맥 데이터 생성',
        '데이터 불균형 해소'
      ]
    },
    settings: {
      model: 'Custom Wavelet GAN',
      steps: 100,
      sampler: 'AdamW',
      cfgScale: 1.0,
      seed: '42',
      resolution: 'N/A',
      batchSize: 16
    }
  },
  {
    id: '3',
    title: 'MRI 데이터 증강 파이프라인',
    description: '뇌 MRI 이미지 증강. 종양 검출 모델 성능 15% 향상',
    author: '염승빈',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeom',
    thumbnailUrl: 'https://images.unsplash.com/photo-1758691463165-ca9b5bc2b28a?w=800&q=80',
    createdAt: '2025-01-10T00:00:00',
    rating: 4.9,
    reviewCount: 156,
    forkedCount: 67,
    viewCount: 1243,
    downloadCount: 560,
    isExpertVerified: true,
    isFavorited: false,
    overview: {
      content: 'T1/T2 가중치 MRI 영상의 공간적 특징을 보존하며 병변 부위의 다양성을 확보하는 레시피입니다.',
      features: [
        '종양 위치 인식 증강',
        '멀티 시퀀스 정합 보존',
        '학습 성능 15% 향상 검증'
      ],
      recommendations: [
        '뇌종양 세그멘테이션',
        '멀티 모달 학습 데이터 확장',
        '모델 일반화 성능 향상'
      ]
    },
    settings: {
      model: 'Medical GAN v2',
      steps: 75,
      sampler: 'DPM++ 2S a',
      cfgScale: 8.0,
      seed: 'Random',
      resolution: '512x512',
      batchSize: 8
    }
  }
];
