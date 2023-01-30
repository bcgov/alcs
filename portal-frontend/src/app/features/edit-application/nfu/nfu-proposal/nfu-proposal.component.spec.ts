import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDto } from '../../../../services/application/application.dto';
import { ApplicationService } from '../../../../services/application/application.service';

import { NfuProposalComponent } from './nfu-proposal.component';

describe('NfuProposalComponent', () => {
  let component: NfuProposalComponent;
  let fixture: ComponentFixture<NfuProposalComponent>;
  let mockApplicationService: DeepMocked<ApplicationService>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    mockApplicationService = createMock();
    mockRouter = createMock();

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
      declarations: [NfuProposalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NfuProposalComponent);
    component = fixture.componentInstance;
    component.$application = new BehaviorSubject<ApplicationDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
