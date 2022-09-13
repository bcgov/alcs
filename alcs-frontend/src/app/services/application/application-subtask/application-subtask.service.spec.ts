import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationSubtaskService } from './application-subtask.service';

describe('CommentService', () => {
  let service: ApplicationSubtaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
      providers: [],
    });
    service = TestBed.inject(ApplicationSubtaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
