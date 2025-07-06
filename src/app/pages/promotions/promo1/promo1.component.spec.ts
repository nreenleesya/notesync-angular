// src/app/pages/promotions/promo1/promo1.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
// Corrected: Assuming your component file is named promo1.component.ts
import { Promo1Component } from './promo1';

describe('Promo1Component', () => {
  let component: Promo1Component;
  let fixture: ComponentFixture<Promo1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Promo1Component] // Import the standalone component
    })
    .compileComponents();

    fixture = TestBed.createComponent(Promo1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct promo title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.promo-title')?.textContent).toContain('PROMO 1: Summer Sale!');
  });

  it('should display the correct discount', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.promo-info')?.textContent).toContain('Discount: 30%');
  });

  it('should have a back button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.back-button')).toBeTruthy();
    expect(compiled.querySelector('.back-button')?.textContent).toContain('Back to Promos');
  });
});
