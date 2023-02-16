import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { OverlaySpinnerService } from './overlay-spinner.service';

describe('OverlaySpinnerService', () => {
  let service: OverlaySpinnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: {} }, OverlaySpinnerService],
    });
    service = TestBed.inject(OverlaySpinnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
