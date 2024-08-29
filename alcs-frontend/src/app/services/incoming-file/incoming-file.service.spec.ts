import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IncomingFileService } from './incoming-file.service';

describe('ApplicationIncomingFileService', () => {
  let service: IncomingFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
    });
    service = TestBed.inject(IncomingFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
