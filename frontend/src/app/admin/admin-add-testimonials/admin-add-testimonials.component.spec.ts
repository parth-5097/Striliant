import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddTestimonialsComponent } from './admin-add-testimonials.component';

describe('AdminAddTestimonialsComponent', () => {
  let component: AdminAddTestimonialsComponent;
  let fixture: ComponentFixture<AdminAddTestimonialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAddTestimonialsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddTestimonialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
