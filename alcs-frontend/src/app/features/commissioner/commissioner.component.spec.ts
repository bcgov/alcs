import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommissionerService } from '../../services/commissioner/commissioner.service';

import { CommissionerComponent } from './commissioner.component';

describe('CommissionerComponent', () => {
  let component: CommissionerComponent;
  let fixture: ComponentFixture<CommissionerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CommissionerComponent],
      providers: [
        {
          provide: CommissionerService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CommissionerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
