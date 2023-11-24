import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDiamondsComponent } from './search-diamonds.component';

describe('SearchDiamondsComponent', () => {
  let component: SearchDiamondsComponent;
  let fixture: ComponentFixture<SearchDiamondsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchDiamondsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchDiamondsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
