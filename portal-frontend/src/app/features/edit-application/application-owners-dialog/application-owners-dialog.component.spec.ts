import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { ApplicationOwnersDialogComponent } from './application-owners-dialog.component';

describe('ApplicationOwnersDialogComponent', () => {
  let component: ApplicationOwnersDialogComponent;
  let fixture: ComponentFixture<ApplicationOwnersDialogComponent>;
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
      declarations: [ApplicationOwnersDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationOwnersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
