import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { RouterOutlet } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: 'home', component: App },
          { path: 'users', component: App }
        ]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title in the logo', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const logoElement = compiled.querySelector('a[routerLink="/home"]');
    expect(logoElement?.textContent?.trim()).toContain('blog');
  });

  it('should contain a router-outlet', () => {
    const debugElement = fixture.debugElement.query(By.directive(RouterOutlet));
    expect(debugElement).toBeTruthy();
  });

  it('should render navigation with correct structure', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const nav = compiled.querySelector('nav');
    expect(nav).toBeTruthy();

    const navContainer = nav?.querySelector('.container-custom');
    expect(navContainer).toBeTruthy();

    const navLinks = navContainer?.querySelector('ul');
    expect(navLinks).toBeTruthy();
  });

  it('should have navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('nav ul li a');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('should have "Accueil" link pointing to /home', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const homeLink = Array.from(compiled.querySelectorAll('nav ul li a'))
      .find((link) => link.textContent?.includes('Accueil')) as HTMLAnchorElement;

    expect(homeLink).toBeTruthy();
    expect(homeLink.getAttribute('routerLink')).toBe('/home');
  });

  it('should render main content area with router-outlet', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const mainContent = compiled.querySelector('main');
    expect(mainContent).toBeTruthy();

    const routerOutlet = mainContent?.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });

  it('should have logo link pointing to /home', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const logoLink = compiled.querySelector('nav a[routerLink="/home"]');
    expect(logoLink?.getAttribute('routerLink')).toBe('/home');
  });
});
