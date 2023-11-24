import { ComponentFixture, TestBed } from '@angular/core/testing';

import { K4cComponent } from './k4c.component';

describe('K4cComponent', () => {
  let component: K4cComponent;
  let fixture: ComponentFixture<K4cComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ K4cComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(K4cComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
