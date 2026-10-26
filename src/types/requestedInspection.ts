/** Proposed requester-facing contract. Confirm with BE before connecting an endpoint. */
export type InspectionTarget = 'RECIPE' | 'UPLOADED_DATA' | 'AUGMENTED_DATA';
export type RequestedInspectionStatus = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
export interface RequestedInspection {
  inspectionId: number;
  target: { type: InspectionTarget; id: number; name: string; imageUrl: string | null };
  status: RequestedInspectionStatus;
  requestedAt: string;
  completedAt: string | null;
  expert: { nickname: string } | null;
  result: { comment: string } | null;
}
