import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Observable } from 'rxjs';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';
import { SharedModule } from '../../../../../shared/shared.module';
import { ParcelComponent } from './parcel.component';

describe('ParcelComponent', () => {
  let component: ParcelComponent;
  let fixture: ComponentFixture<ParcelComponent>;

  let mockRoute: DeepMocked<ActivatedRoute>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    mockAppDocumentService = createMock();
    mockRoute = createMock();
    mockRoute.fragment = new Observable<string | null>();

    await TestBed.configureTestingModule({
      declarations: [ParcelComponent],
      providers: [
        {
          provides: ApplicationDocumentService,
          useValue: mockAppDocumentService,
        },
        {
          provide: ActivatedRoute,
          useValue: mockRoute,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [SharedModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ParcelComponent);
    component = fixture.componentInstance;
    component.application = {
      parcels: [],
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
