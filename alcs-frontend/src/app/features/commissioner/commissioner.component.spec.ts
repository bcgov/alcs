import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CommissionerService } from '../../services/commissioner/commissioner.service';

import { CommissionerComponent } from './commissioner.component';

describe('CommissionerComponent', () => {
  let component: CommissionerComponent;
  let fixture: ComponentFixture<CommissionerComponent>;
  let mockCommissionerService: DeepMocked<CommissionerService>;

  beforeEach(async () => {
    mockCommissionerService = createMock();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommissionerComponent],
      providers: [
        {
          provide: CommissionerService,
          useValue: mockCommissionerService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CommissionerComponent);
    component = fixture.componentInstance;

    mockCommissionerService.fetchApplication.mockResolvedValue({} as any);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
