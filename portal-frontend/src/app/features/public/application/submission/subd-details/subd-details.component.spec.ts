import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../../services/public/public.service';

import { SubdDetailsComponent } from './subd-details.component';

describe('SubdDetailsComponent', () => {
  let component: SubdDetailsComponent;
  let fixture: ComponentFixture<SubdDetailsComponent>;
  let mockPublicService: DeepMocked<PublicService>;

  beforeEach(async () => {
    mockPublicService = createMock();

    await TestBed.configureTestingModule({
      declarations: [SubdDetailsComponent],
      providers: [
        {
          provide: PublicService,
          useValue: mockPublicService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubdDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
