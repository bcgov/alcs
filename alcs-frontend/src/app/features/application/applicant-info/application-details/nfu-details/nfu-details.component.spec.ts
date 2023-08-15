import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationDocumentService } from '../../../../../services/application/application-document/application-document.service';

import { NfuDetailsComponent } from './nfu-details.component';

describe('NfuDetailsComponent', () => {
  let component: NfuDetailsComponent;
  let fixture: ComponentFixture<NfuDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ApplicationDocumentService,
          useValue: {},
        },
      ],
      declarations: [NfuDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NfuDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
