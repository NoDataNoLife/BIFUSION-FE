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
  verificationStatus?: 'NONE' | 'PENDING' | 'COMPLETED';
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
    verificationStatus: 'COMPLETED',
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
  }
];
