import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CardSubtaskService } from './card-subtask.service';

describe('CommentService', () => {
  let service: CardSubtaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
      providers: [],
    });
    service = TestBed.inject(CardSubtaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
