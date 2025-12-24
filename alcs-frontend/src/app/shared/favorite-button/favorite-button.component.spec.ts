import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BehaviorSubject } from 'rxjs';
import { UserDto } from '../../services/user/user.dto';
import { UserService } from '../../services/user/user.service';

import { FavoriteButtonComponent } from './favorite-button.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('FavoriteButtonComponent', () => {
  let component: FavoriteButtonComponent;
  let fixture: ComponentFixture<FavoriteButtonComponent>;
  let mockUserService: DeepMocked<UserService>;

  beforeEach(async () => {
    mockUserService = createMock();
    mockUserService.$userProfile = new BehaviorSubject<UserDto | undefined>(undefined);

    await TestBed.configureTestingModule({
    declarations: [FavoriteButtonComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [MatSnackBarModule],
    providers: [
        {
            provide: UserService,
            useValue: mockUserService,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(FavoriteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
