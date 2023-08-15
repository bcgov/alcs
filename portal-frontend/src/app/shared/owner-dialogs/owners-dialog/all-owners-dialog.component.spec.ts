import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { AllOwnersDialogComponent } from './all-owners-dialog.component';

describe('ApplicationOwnersDialogComponent', () => {
  let component: AllOwnersDialogComponent;
  let fixture: ComponentFixture<AllOwnersDialogComponent>;
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
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
      declarations: [AllOwnersDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AllOwnersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
