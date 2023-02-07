import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { ApplicationDetailedDto } from '../../../services/application/application.dto';
import { ApplicationService } from '../../../services/application/application.service';

import { LandUseComponent } from './land-use.component';

describe('LandUseComponent', () => {
  let component: LandUseComponent;
  let fixture: ComponentFixture<LandUseComponent>;
  let mockAppService: DeepMocked<ApplicationService>;
  let mockHttpClient: DeepMocked<HttpClient>;
  let mockRouter: DeepMocked<Router>;
  let applicationPipe = new BehaviorSubject<ApplicationDetailedDto | undefined>(undefined);

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
          provide: ApplicationService,
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
