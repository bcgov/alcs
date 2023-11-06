import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { RouterTestingModule } from '@angular/router/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MessageService } from '../../../services/message/message.service';

import { NotificationsComponent } from './notifications.component';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let mockMessageService: DeepMocked<MessageService>;

  beforeEach(async () => {
    mockMessageService = createMock();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatMenuModule],
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
      declarations: [NotificationsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;

    mockMessageService.fetchMyNotifications.mockResolvedValue([]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
