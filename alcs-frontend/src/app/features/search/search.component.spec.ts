import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApplicationRegionDto } from '../../services/application/application-code.dto';
import { ApplicationLocalGovernmentService } from '../../services/application/application-local-government/application-local-government.service';
import { ApplicationService } from '../../services/application/application.service';
import { SearchService } from '../../services/search/search.service';
import { ToastService } from '../../services/toast/toast.service';

import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let mockSearchService: DeepMocked<SearchService>;
  let mockToastService: DeepMocked<ToastService>;
  let mockLocalGovernmentService: DeepMocked<ApplicationLocalGovernmentService>;
  let mockApplicationService: DeepMocked<ApplicationService>;

  beforeEach(async () => {
    mockSearchService = createMock();
    mockToastService = createMock();
    mockLocalGovernmentService = createMock();
    mockApplicationService = createMock();

    mockApplicationService.$applicationRegions = new BehaviorSubject<ApplicationRegionDto[]>([]);

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: new Observable<ParamMap>(),
          },
        },
        {
          provide: ToastService,
          useValue: mockToastService,
        },
        {
          provide: ApplicationLocalGovernmentService,
          useValue: mockLocalGovernmentService,
        },
        {
          provide: ApplicationService,
          useValue: mockApplicationService,
        },
      ],
      declarations: [SearchComponent],
      imports: [MatAutocompleteModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
