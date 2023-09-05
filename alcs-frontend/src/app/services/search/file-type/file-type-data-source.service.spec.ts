import { TestBed } from '@angular/core/testing';

import { FileTypeDataSourceService } from './file-type-data-source.service';

describe('FileTypeDataSourceService', () => {
  let service: FileTypeDataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileTypeDataSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
