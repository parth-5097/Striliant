import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDiamondsDetailsComponent } from './admin-diamonds-details.component';

describe('AdminDiamondsDetailsComponent', () => {
  let component: AdminDiamondsDetailsComponent;
  let fixture: ComponentFixture<AdminDiamondsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminDiamondsDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDiamondsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
