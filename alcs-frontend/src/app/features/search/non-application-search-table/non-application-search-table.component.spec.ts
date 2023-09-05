import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { NonApplicationSearchTableComponent } from './non-application-search-table.component';

describe('NonApplicationSearchTableComponent', () => {
  let component: NonApplicationSearchTableComponent;
  let fixture: ComponentFixture<NonApplicationSearchTableComponent>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    mockRouter = createMock();
    
    await TestBed.configureTestingModule({
      declarations: [NonApplicationSearchTableComponent],
      providers: [
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NonApplicationSearchTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
