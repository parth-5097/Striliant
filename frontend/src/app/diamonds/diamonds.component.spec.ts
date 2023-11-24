import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiamondsComponent } from './diamonds.component';

describe('DiamondsComponent', () => {
  let component: DiamondsComponent;
  let fixture: ComponentFixture<DiamondsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiamondsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiamondsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
