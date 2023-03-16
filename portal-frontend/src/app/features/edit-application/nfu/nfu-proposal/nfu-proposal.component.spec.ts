import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationProposalDetailedDto } from '../../../../services/application/application-proposal.dto';
import { ApplicationProposalService } from '../../../../services/application/application-proposal.service';

import { NfuProposalComponent } from './nfu-proposal.component';

describe('NfuProposalComponent', () => {
  let component: NfuProposalComponent;
  let fixture: ComponentFixture<NfuProposalComponent>;
  let mockApplicationService: DeepMocked<ApplicationProposalService>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockRouter = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationProposalService,
          useValue: mockApplicationService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
      declarations: [NfuProposalComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NfuProposalComponent);
    component = fixture.componentInstance;
    component.$application = new BehaviorSubject<ApplicationProposalDetailedDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
