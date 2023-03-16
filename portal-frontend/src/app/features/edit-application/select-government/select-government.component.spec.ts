import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationProposalDetailedDto } from '../../../services/application/application-proposal.dto';
import { ApplicationProposalService } from '../../../services/application/application-proposal.service';
import { CodeService } from '../../../services/code/code.service';

import { SelectGovernmentComponent } from './select-government.component';

describe('SelectGovernmentComponent', () => {
  let component: SelectGovernmentComponent;
  let fixture: ComponentFixture<SelectGovernmentComponent>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockAppService: DeepMocked<ApplicationProposalService>;

  beforeEach(async () => {
    mockCodeService = createMock();
    mockAppService = createMock();

    await TestBed.configureTestingModule({
      declarations: [SelectGovernmentComponent, MatAutocomplete],
      providers: [
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        { provide: ApplicationProposalService, useValue: mockAppService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectGovernmentComponent);
    component = fixture.componentInstance;
    component.$application = new BehaviorSubject<ApplicationProposalDetailedDto | undefined>(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
