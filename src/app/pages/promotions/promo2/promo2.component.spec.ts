// src/app/pages/promotions/promo2/promo2.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Promo2Component } from './promo2';

describe('Promo2Component', () => {
  let component: Promo2Component;
  let fixture: ComponentFixture<Promo2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Promo2Component] // Import the standalone component
    })
    .compileComponents();

    fixture = TestBed.createComponent(Promo2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct promo title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.promo-title')?.textContent).toContain('PROMO 2: New User Deals');
  });

  it('should display the correct eligibility', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.promo-info')?.textContent).toContain('Eligibility: First-time buyers only');
  });

  it('should have a back button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.back-button')).toBeTruthy();
    expect(compiled.querySelector('.back-button')?.textContent).toContain('Back to Promos');
  });
});
