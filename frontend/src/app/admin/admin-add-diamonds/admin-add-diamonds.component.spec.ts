import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddDiamondsComponent } from './admin-add-diamonds.component';

describe('AdminAddDiamondsComponent', () => {
  let component: AdminAddDiamondsComponent;
  let fixture: ComponentFixture<AdminAddDiamondsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAddDiamondsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddDiamondsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
