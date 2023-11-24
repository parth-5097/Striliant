import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddBrandsComponent } from './admin-add-brands.component';

describe('AdminAddBrandsComponent', () => {
  let component: AdminAddBrandsComponent;
  let fixture: ComponentFixture<AdminAddBrandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAddBrandsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddBrandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
