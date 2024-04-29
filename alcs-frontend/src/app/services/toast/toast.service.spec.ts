import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let mockSnackbar: DeepMocked<MatSnackBar>;

  beforeEach(() => {
    mockSnackbar = createMock();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: MatSnackBar,
          useValue: mockSnackbar,
        },
      ],
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the toast service with success for success toast', () => {
    mockSnackbar.open.mockReturnValue({} as any);

    service.showSuccessToast('Toast');

    expect(mockSnackbar.open).toHaveBeenCalledTimes(1);
    expect(mockSnackbar.open.mock.calls[0][2]?.panelClass).toEqual('success');
  });

  it('should call the toast service with warning for warning toast', () => {
    mockSnackbar.open.mockReturnValue({} as any);

    service.showWarningToast('Toast');

    expect(mockSnackbar.open).toHaveBeenCalledTimes(1);
    expect(mockSnackbar.open.mock.calls[0][2]?.panelClass).toEqual('warning');
  });

  it('should call the toast service with error for error toast', () => {
    mockSnackbar.open.mockReturnValue({} as any);

    service.showErrorToast('Toast');

    expect(mockSnackbar.open).toHaveBeenCalledTimes(1);
    expect(mockSnackbar.open.mock.calls[0][2]?.panelClass).toEqual('error');
  });
});
