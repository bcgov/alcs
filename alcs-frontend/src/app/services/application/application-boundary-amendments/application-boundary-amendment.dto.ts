export interface ApplicationBoundaryAmendmentDto {
  fileNumber: string;
  uuid: string;
  type: string;
  area: number;
  year?: number;
  period?: number;
  decisionComponents: {
    label: string;
    uuid: string;
  }[];
}

export interface CreateApplicationBoundaryAmendmentDto {
  type: string;
  area: number;
  year?: number;
  period?: number;
  decisionComponentUuids: string[];
}

export interface UpdateApplicationBoundaryAmendmentDto {
  type?: string;
  area?: number;
  year?: number;
  period?: number;
  decisionComponentUuids?: string[];
}
