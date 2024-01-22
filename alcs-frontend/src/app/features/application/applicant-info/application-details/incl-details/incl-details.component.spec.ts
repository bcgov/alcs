import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeepMocked } from '@golevelup/ts-jest';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';

import { InclDetailsComponent } from './incl-details.component';

describe('ExclDetailsComponent', () => {
  let component: InclDetailsComponent;
  let fixture: ComponentFixture<InclDetailsComponent>;
  let mockAppDocumentService: DeepMocked<ApplicationDocumentService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InclDetailsComponent],
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: mockAppDocumentService,
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
