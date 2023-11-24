import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDiamondsComponent } from './admin-diamonds.component';

describe('AdminDiamondsComponent', () => {
  let component: AdminDiamondsComponent;
  let fixture: ComponentFixture<AdminDiamondsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminDiamondsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDiamondsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
