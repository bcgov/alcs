export interface ApplicationDto {
  fileNumber: string;
  title: string;
  body: string;
  status: string;
}

export interface ApplicationPartialDto {
  fileNumber: string;
  title?: string;
  body?: string;
  status?: string;
}
