export class DocumentGenerationOptions {
  constructor(data?: Partial<DocumentGenerationOptions>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  cacheReport = false;
  convertTo = 'pdf';
  overwrite = true;
  reportName: string;
}

export class DocumentGenerationTemplate {
  constructor(data?: Partial<DocumentGenerationTemplate>) {
    if (data) {
      Object.assign(this, data);
    }
  }
  encodingType = 'base64';
  fileType = 'docx';
  content: string;
}

export class DocumentGenerationModel {
  constructor(data?: Partial<DocumentGenerationModel>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  data: any;
  formatters: any = '';
  options: DocumentGenerationOptions;
  template: DocumentGenerationTemplate;
}
