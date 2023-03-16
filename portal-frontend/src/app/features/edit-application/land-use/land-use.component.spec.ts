import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationProposalDetailedDto } from '../../../services/application/application-proposal.dto';
import { ApplicationProposalService } from '../../../services/application/application-proposal.service';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LandUseComponent } from './land-use.component';

describe('LandUseComponent', () => {
  let component: LandUseComponent;
  let fixture: ComponentFixture<LandUseComponent>;
  let mockAppService: DeepMocked<ApplicationProposalService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockRouter: DeepMocked<Router>;
  let applicationPipe = new BehaviorSubject<ApplicationProposalDetailedDto | undefined>(undefined);

  beforeEach(async () => {
    mockAppService = createMock();
    mockHttpClient = createMock();
    mockRouter = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: mockRouter,
        },
        {
          provide: ApplicationProposalService,
          useValue: mockAppService,
        },
        {
          provide: HttpClient,
          useValue: mockHttpClient,
        },
      ],
      declarations: [LandUseComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LandUseComponent);
    component = fixture.componentInstance;
    component.$application = applicationPipe;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
