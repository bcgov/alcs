import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { PublicService } from '../../../services/public/public.service';

import { PublicApplicationComponent } from './public-application.component';

describe('PublicApplicationComponent', () => {
  let component: PublicApplicationComponent;
  let fixture: ComponentFixture<PublicApplicationComponent>;

  let mockRoute;
  let mockPublicService: DeepMocked<PublicService>;

  let routeParamMap: BehaviorSubject<Map<string, any>>;

  beforeEach(async () => {
    mockRoute = createMock();
    mockPublicService = createMock();

    routeParamMap = new BehaviorSubject(new Map());
    mockRoute.paramMap = routeParamMap;

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockRoute,
        },
        {
          provide: PublicService,
          useValue: mockPublicService,
        },
      ],
      declarations: [PublicApplicationComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
