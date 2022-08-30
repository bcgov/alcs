import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailService } from '../../../services/application/application-detail.service';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { InfoRequestsComponent } from './info-requests.component';

describe('InfoRequestsComponent', () => {
  let component: InfoRequestsComponent;
  let fixture: ComponentFixture<InfoRequestsComponent>;
  const mockAppDetailService = jasmine.createSpyObj<ApplicationDetailService>('ApplicationDetailService', [
    'loadApplication',
  ]);
  mockAppDetailService.$application = new BehaviorSubject<ApplicationDetailedDto | undefined>(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfoRequestsComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: MatDialog,
          useValue: {},
        },
        { provide: ApplicationDetailService, useValue: mockAppDetailService },
        { provide: ConfirmationDialogService, useValue: {} },
      ],
      imports: [HttpClientTestingModule, MatSnackBarModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
