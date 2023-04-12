import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnarchiveCardService } from '../../../services/unarchive-card/unarchive-card.service';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';

import { UnarchiveComponent } from './unarchive.component';

describe('UnarchiveComponent', () => {
  let component: UnarchiveComponent;
  let fixture: ComponentFixture<UnarchiveComponent>;
  let mockUnarchiveService: DeepMocked<UnarchiveCardService>;
  let mockConformationDialogService: DeepMocked<ConfirmationDialogService>;

  beforeEach(async () => {
    mockUnarchiveService = createMock();
    mockConformationDialogService = createMock();

    await TestBed.configureTestingModule({
      declarations: [UnarchiveComponent],
      providers: [
        {
          provide: UnarchiveCardService,
          useValue: mockUnarchiveService,
        },
        {
          provide: ConfirmationDialogService,
          useValue: mockConformationDialogService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UnarchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
