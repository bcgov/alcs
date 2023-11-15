import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationService } from '../../../services/application/application.service';
import { HomeService } from '../../../services/home/home.service';

import { AssignedComponent } from './assigned.component';

describe('AssignedComponent', () => {
  let component: AssignedComponent;
  let fixture: ComponentFixture<AssignedComponent>;
  let mockHomeService: DeepMocked<HomeService>;

  beforeEach(async () => {
    mockHomeService = createMock();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ApplicationService,
          useValue: {
            setup: jest.fn(),
            $cardStatuses: new EventEmitter(),
          },
        },
        { provide: HomeService, useValue: mockHomeService },
      ],
      declarations: [AssignedComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignedComponent);
    component = fixture.componentInstance;

    mockHomeService.fetchAssignedToMe.mockResolvedValue({
      applications: [],
      covenants: [],
      modifications: [],
      noticeOfIntentModifications: [],
      planningReviews: [],
      reconsiderations: [],
      noticeOfIntents: [],
      notifications: [],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
