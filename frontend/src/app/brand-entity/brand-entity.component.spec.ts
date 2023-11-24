import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandEntityComponent } from './brand-entity.component';

describe('BrandEntityComponent', () => {
  let component: BrandEntityComponent;
  let fixture: ComponentFixture<BrandEntityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandEntityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
