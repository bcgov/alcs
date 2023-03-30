import { TestBed } from '@angular/core/testing';

import { ApplicationSubmissionDocumentGenerationService } from './application-submission-document-generation.service';

describe('ApplicationSubmissionDocumentGenerationService', () => {
  let service: ApplicationSubmissionDocumentGenerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationSubmissionDocumentGenerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
