import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DeepMocked } from '@golevelup/ts-jest';

import { ApplicationSearchTableComponent } from './application-search-table.component';

describe('ApplicationSearchTableComponent', () => {
  let component: ApplicationSearchTableComponent;
  let fixture: ComponentFixture<ApplicationSearchTableComponent>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationSearchTableComponent],
      providers: [
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationSearchTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
