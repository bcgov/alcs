export class ApplicationDto {
  fileNumber: string;
  title: string;
  body: string;
  status: string;
}

export class ApplicationPartialDto {
  fileNumber: string;
  title?: string;
  body?: string;
  status?: string;
}
