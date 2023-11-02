import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CodeService } from '../../../services/code/code.service';
import { SearchService } from '../../../services/search/search.service';
import { StatusService } from '../../../services/status/status.service';
import { ToastService } from '../../../services/toast/toast.service';

import { PublicSearchComponent } from './public-search.component';

describe('PublicSearchComponent', () => {
  let component: PublicSearchComponent;
  let fixture: ComponentFixture<PublicSearchComponent>;
  let mockSearchService: DeepMocked<SearchService>;
  let mockCodeService: DeepMocked<CodeService>;
  let mockStatusService: DeepMocked<StatusService>;

  beforeEach(async () => {
    mockCodeService = createMock();
    mockSearchService = createMock();
    mockStatusService = createMock();

    await TestBed.configureTestingModule({
      imports: [MatAutocompleteModule],
      declarations: [PublicSearchComponent],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
        {
          provide: CodeService,
          useValue: mockCodeService,
        },
        {
          provide: StatusService,
          useValue: mockStatusService,
        },
        {
          provide: ToastService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicSearchComponent);
    component = fixture.componentInstance;

    mockCodeService.loadCodes.mockResolvedValue({
      localGovernments: [],
      applicationTypes: [],
      decisionMakers: [],
      documentTypes: [],
      naruSubtypes: [],
      noticeOfIntentTypes: [],
      regions: [],
      submissionTypes: [],
    });

    mockStatusService.getStatuses.mockResolvedValue([]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
