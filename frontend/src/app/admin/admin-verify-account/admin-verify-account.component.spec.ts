import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminVerifyAccountComponent } from './admin-verify-account.component';

describe('AdminVerifyAccountComponent', () => {
  let component: AdminVerifyAccountComponent;
  let fixture: ComponentFixture<AdminVerifyAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminVerifyAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminVerifyAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
