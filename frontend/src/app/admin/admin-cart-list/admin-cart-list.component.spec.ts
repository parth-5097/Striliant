import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCartListComponent } from './admin-cart-list.component';

describe('AdminCartListComponent', () => {
  let component: AdminCartListComponent;
  let fixture: ComponentFixture<AdminCartListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCartListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCartListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
