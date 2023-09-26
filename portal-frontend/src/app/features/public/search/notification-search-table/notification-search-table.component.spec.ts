import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { NotificationSearchTableComponent } from './notification-search-table.component';

describe('NotificationSearchTableComponent', () => {
  let component: NotificationSearchTableComponent;
  let fixture: ComponentFixture<NotificationSearchTableComponent>;
  let mockRouter: DeepMocked<Router>;

  beforeEach(async () => {
    mockRouter = createMock();

    await TestBed.configureTestingModule({
      declarations: [NotificationSearchTableComponent],
      providers: [
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationSearchTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
