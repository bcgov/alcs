import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CodeService } from './code.service';

describe('CodeService', () => {
  let service: CodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
