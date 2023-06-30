import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ApplicationParcelService } from '../../../../services/application/application-parcel/application-parcel.service';

import { ParcelPrepComponent } from './parcel-prep.component';

describe('ParcelPrepComponent', () => {
  let component: ParcelPrepComponent;
  let fixture: ComponentFixture<ParcelPrepComponent>;
  let mockAppParcelService: DeepMocked<ApplicationParcelService>;

  beforeEach(async () => {
    mockAppParcelService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ParcelPrepComponent],
      providers: [
        {
          provide: ApplicationParcelService,
          useValue: mockAppParcelService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelPrepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
