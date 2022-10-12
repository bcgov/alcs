import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  ApplicationRegionDto,
  ApplicationTypeDto,
  CardStatusDto,
} from '../../../services/application/application-code.dto';
import { ApplicationLocalGovernmentDto } from '../../../services/application/application-local-government/application-local-government.dto';
import {
  ApplicationReconsiderationDto,
  ReconsiderationTypeDto,
} from '../../../services/application/application-reconsideration/application-reconsideration.dto';
import { CardDto } from '../../../services/card/card.dto';
import { ConfirmationDialogService } from '../../../shared/confirmation-dialog/confirmation-dialog.service';
import { SharedModule } from '../../../shared/shared.module';

import { ReconCardDetailDialogComponent } from './recon-card-detail-dialog.component';

describe('ReconCardDetailDialogComponent', () => {
  let component: ReconCardDetailDialogComponent;
  let fixture: ComponentFixture<ReconCardDetailDialogComponent>;

  const mockCardStatusDetails: CardStatusDto = {
    label: 'test_st',
    code: 'STATUS',
    description: 'this is a test status',
  };

  const mockApplicationRegionDetails: ApplicationRegionDto = {
    label: 'test_st',
    code: 'STATUS',
    description: 'this is a test status',
  };

  const mockReconType: ReconsiderationTypeDto = {
    label: 'test_ty',
    code: 'TYPE',
    description: 'this is a test type',
    textColor: '#000',
    backgroundColor: '#fff',
  };

  const mockReconDto: ApplicationReconsiderationDto = {
    uuid: '',
    board: {
      code: 'fake',
      title: 'Fake',
      decisionMaker: '',
    },
    type: {} as ReconsiderationTypeDto,
    submittedDate: new Date(),
    application: {
      fileNumber: '',
      type: {} as ApplicationTypeDto,
      applicant: '',
      region: {
        code: 'FAKE_REGION',
      } as ApplicationRegionDto,
      localGovernment: {} as ApplicationLocalGovernmentDto,
      decisionMeetings: [],
    },
    card: {
      status: {
        code: 'FAKE_STATUS',
      },
      board: {
        code: 'FAKE_BOARD',
      },
    } as CardDto,
  };

  beforeEach(async () => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed', 'backdropClick', 'subscribe']);
    mockDialogRef.backdropClick = () => new EventEmitter();

    await TestBed.configureTestingModule({
      declarations: [ReconCardDetailDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            statusDetails: {
              code: 'fake',
            },
          },
        },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: ConfirmationDialogService, useValue: {} },
      ],
      imports: [HttpClientTestingModule, MatDialogModule, MatSnackBarModule, FormsModule, MatMenuModule, SharedModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ReconCardDetailDialogComponent);
    component = fixture.componentInstance;
    component.data = mockReconDto;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
