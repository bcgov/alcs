import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotificationDocumentService } from '../../../../services/notification-document/notification-document.service';

import { ProposalDetailsComponent } from './proposal-details.component';

describe('ProposalDetailsComponent', () => {
  let component: ProposalDetailsComponent;
  let fixture: ComponentFixture<ProposalDetailsComponent>;
  let mockNoiDocumentService: DeepMocked<NotificationDocumentService>;

  beforeEach(async () => {
    mockNoiDocumentService = createMock();

    await TestBed.configureTestingModule({
      declarations: [ProposalDetailsComponent],
      providers: [
        {
          provide: NotificationDocumentService,
          useValue: mockNoiDocumentService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
