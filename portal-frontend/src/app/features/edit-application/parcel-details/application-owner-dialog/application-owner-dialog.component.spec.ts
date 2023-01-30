import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationOwnerService } from '../../../../services/application-owner/application-owner.service';

import { ApplicationOwnerDialogComponent } from './application-owner-dialog.component';

describe('ApplicationOwnerDialogComponent', () => {
  let component: ApplicationOwnerDialogComponent;
  let fixture: ComponentFixture<ApplicationOwnerDialogComponent>;
  let mockAppOwnerService: DeepMocked<ApplicationOwnerService>;

  beforeEach(async () => {
    mockAppOwnerService = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationOwnerService,
          useValue: mockAppOwnerService,
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
      declarations: [ApplicationOwnerDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationOwnerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
