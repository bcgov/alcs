import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotificationParcelService } from '../../../../../services/notification/notification-parcel/notification-parcel.service';
import { ParcelComponent } from './parcel.component';

describe('ParcelComponent', () => {
  let component: ParcelComponent;
  let fixture: ComponentFixture<ParcelComponent>;

  let mockParcelService: DeepMocked<NotificationParcelService>;
  let mockRoute: DeepMocked<ActivatedRoute>;

  beforeEach(async () => {
    mockParcelService = createMock();
    mockRoute = createMock();

    await TestBed.configureTestingModule({
      declarations: [ParcelComponent],
      providers: [
        {
          provide: NotificationParcelService,
          useValue: mockParcelService,
        },
        {
          provide: ActivatedRoute,
          useValue: mockRoute,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelComponent);
    component = fixture.componentInstance;
    component.parcels = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
