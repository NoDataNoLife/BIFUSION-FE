export interface Recipe {
  id: string;
  name: string;
  author: string;
  authorAvatar: string;
  isExpertVerified: boolean;
  rating: number;
  reviewCount: number;
  forkCount: number;
  usageCount: number;
  thumbnail: string;
  description: string;
  createdAt: string;
}

export const ALL_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Lung Cancer High-Res Enhancement',
    author: '이민지',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lee',
    isExpertVerified: true,
    rating: 4.5,
    reviewCount: 89,
    forkCount: 32,
    usageCount: 450,
    thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80',
    description: '폐암 진단 데이터셋을 위한 해상도 개선 및 노이즈 제거 레시피',
    createdAt: '2025-02-01',
  },
  {
    id: '2',
    name: '심장 질환 예측 모델 최적화 (Heart Disease)',
    author: '김성한',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
    isExpertVerified: true,
    rating: 4.8,
    reviewCount: 127,
    forkCount: 45,
    usageCount: 892,
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    description: 'ECG 데이터 증강을 위한 고성능 레시피. FID Score 12.3 달성',
    createdAt: '2025-01-15',
  },
  {
    id: '3',
    name: 'MRI 데이터 증강 파이프라인',
    author: '염승빈',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeom',
    isExpertVerified: true,
    rating: 4.9,
    reviewCount: 156,
    forkCount: 67,
    usageCount: 1243,
    thumbnail: 'https://images.unsplash.com/photo-1758691463165-ca9b5bc2b28a?w=800&q=80',
    description: '뇌 MRI 이미지 증강. 종양 검출 모델 성능 15% 향상',
    createdAt: '2025-01-10',
  },
];
