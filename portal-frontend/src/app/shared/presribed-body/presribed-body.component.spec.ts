import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { UserDto } from '../../services/authentication/authentication.dto';
import { AuthenticationService } from '../../services/authentication/authentication.service';

import { PresribedBodyComponent } from './presribed-body.component';

describe('PresribedBodyComponent', () => {
  let component: PresribedBodyComponent;
  let fixture: ComponentFixture<PresribedBodyComponent>;
  let mockAuthService: DeepMocked<AuthenticationService>;

  beforeEach(async () => {
    mockAuthService = createMock();
    mockAuthService.$currentProfile = new BehaviorSubject<UserDto | undefined>(undefined);

    await TestBed.configureTestingModule({
      declarations: [PresribedBodyComponent],
      providers: [
        {
          provide: AuthenticationService,
          useValue: mockAuthService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PresribedBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
