import { TestBed } from '@angular/core/testing';

import { FileTagService } from './file-tag.service';

describe('FileTagService', () => {
  let service: FileTagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileTagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
