import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationOwnerService } from '../../../services/application-owner/application-owner.service';
import { ApplicationParcelDto } from '../../../services/application-parcel/application-parcel.dto';
import { ApplicationParcelService } from '../../../services/application-parcel/application-parcel.service';
import { ApplicationProposalDetailedDto } from '../../../services/application/application-proposal.dto';
import { ParcelComponent } from './parcel.component';

describe('ParcelComponent', () => {
  let component: ParcelComponent;
  let fixture: ComponentFixture<ParcelComponent>;

  let mockHttpClient: DeepMocked<HttpClient>;
  let mockApplicationParcelService: DeepMocked<ApplicationParcelService>;
  let mockParcel = {} as ApplicationParcelDto;
  let mockAppOwnerService: DeepMocked<ApplicationOwnerService>;

  beforeEach(async () => {
    mockHttpClient = createMock();
    mockApplicationParcelService = createMock();
    mockAppOwnerService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ParcelComponent],
      providers: [
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
        {
          provide: ApplicationParcelService,
          useValue: mockApplicationParcelService,
        },
        {
          provide: ApplicationOwnerService,
          useValue: mockAppOwnerService,
        },
        {
          provides: Router,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelComponent);
    component = fixture.componentInstance;
    component.$application = new BehaviorSubject<ApplicationProposalDetailedDto | undefined>(
      {} as ApplicationProposalDetailedDto
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
