import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../../services/public/public.service';

import { NfuDetailsComponent } from './nfu-details.component';

describe('NfuDetailsComponent', () => {
  let component: NfuDetailsComponent;
  let fixture: ComponentFixture<NfuDetailsComponent>;
  let mockPublicService: DeepMocked<PublicService>;

  beforeEach(async () => {
    mockPublicService = createMock();

    await TestBed.configureTestingModule({
      declarations: [NfuDetailsComponent],
      providers: [
        {
          provide: PublicService,
          useValue: mockPublicService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NfuDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
