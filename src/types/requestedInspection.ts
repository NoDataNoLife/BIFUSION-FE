export type InspectionTarget = 'RECIPE' | 'UPLOADED_DATA' | 'AUGMENTED_DATA';
export type RequestedInspectionStatus = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
export interface RequestedInspection {
  inspectionRequestId: number;
  target: { type: InspectionTarget; id: number; jobId: number | null; name: string; imageUrl: string | null; deleted: boolean };
  status: RequestedInspectionStatus;
  requestedAt: string;
  completedAt: string | null;
  expert: { nickname: string } | null;
  result: { comment: string | null } | null;
  reason?: string | null;
  rewardPoints?: number;
}
export interface RequestedInspectionPage {
  content: RequestedInspection[];
  page: number;
  totalElements: number;
  totalPages: number;
}
