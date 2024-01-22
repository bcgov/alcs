import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { PublicService } from '../../../../../services/public/public.service';
import { InclDetailsComponent } from './incl-details.component';

describe('InclDetailsComponent', () => {
  let component: InclDetailsComponent;
  let fixture: ComponentFixture<InclDetailsComponent>;
  let mockPublicService: DeepMocked<PublicService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InclDetailsComponent],
      providers: [
        {
          provide: PublicService,
          useValue: mockPublicService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InclDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
