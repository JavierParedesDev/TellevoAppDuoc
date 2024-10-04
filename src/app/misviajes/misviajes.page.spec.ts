import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisviajesPage } from './misviajes.page';

describe('MisviajesPage', () => {
  let component: MisviajesPage;
  let fixture: ComponentFixture<MisviajesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisviajesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
