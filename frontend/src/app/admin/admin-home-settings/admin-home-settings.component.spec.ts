import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHomeSettingsComponent } from './admin-home-settings.component';

describe('AdminHomeSettingsComponent', () => {
  let component: AdminHomeSettingsComponent;
  let fixture: ComponentFixture<AdminHomeSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminHomeSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminHomeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
