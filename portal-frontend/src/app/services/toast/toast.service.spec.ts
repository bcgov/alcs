import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let mockSnackBarService: DeepMocked<MatSnackBar>;

  beforeEach(() => {
    mockSnackBarService = createMock();

    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        {
          provide: MatSnackBar,
          useValue: mockSnackBarService,
        },
      ],
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call snackBar for showSuccessToast', () => {
    mockSnackBarService.open.mockReturnValue({} as any);
    const res = service.showSuccessToast('text');
    expect(mockSnackBarService.open).toHaveBeenCalledTimes(1);
  });

  it('should call snackBar for showWarningToast', () => {
    mockSnackBarService.open.mockReturnValue({} as any);
    const res = service.showWarningToast('text');
    expect(mockSnackBarService.open).toHaveBeenCalledTimes(1);
  });

  it('should call snackBar for showErrorToast', () => {
    mockSnackBarService.open.mockReturnValue({} as any);
    const res = service.showErrorToast('text');
    expect(mockSnackBarService.open).toHaveBeenCalledTimes(1);
  });
});
