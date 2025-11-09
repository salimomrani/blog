import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareComponent } from './share.component';

describe('ShareComponent', () => {
  let component: ShareComponent;
  let fixture: ComponentFixture<ShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ShareComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    fixture.detectChanges();
    expect(component.title()).toBe('');
    expect(component.url()).toBe('');
    expect(component.description()).toBe('');
    expect(component.showLabels()).toBe(false);
    expect(component.size()).toBe('medium');
  });

  it('should render share buttons', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.share-button');
    expect(buttons.length).toBe(5); // Twitter, Facebook, LinkedIn, Email, Copy
  });

  it('should show labels when showLabels is true', () => {
    fixture.componentRef.setInput('showLabels', true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const labels = compiled.querySelectorAll('.share-button span');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('should emit shared event on Twitter share', () => {
    const shareSpy = jest.fn();
    component.shared.subscribe(shareSpy);

    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();

    component.shareOnTwitter();

    expect(shareSpy).toHaveBeenCalledWith('twitter');
    expect(windowOpenSpy).toHaveBeenCalled();

    windowOpenSpy.mockRestore();
  });

  it('should emit shared event on Facebook share', () => {
    const shareSpy = jest.fn();
    component.shared.subscribe(shareSpy);

    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();

    component.shareOnFacebook();

    expect(shareSpy).toHaveBeenCalledWith('facebook');
    expect(windowOpenSpy).toHaveBeenCalled();

    windowOpenSpy.mockRestore();
  });

  it('should emit shared event on LinkedIn share', () => {
    const shareSpy = jest.fn();
    component.shared.subscribe(shareSpy);

    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();

    component.shareOnLinkedIn();

    expect(shareSpy).toHaveBeenCalledWith('linkedin');
    expect(windowOpenSpy).toHaveBeenCalled();

    windowOpenSpy.mockRestore();
  });

  it('should copy link to clipboard', async () => {
    const shareSpy = jest.fn();
    component.shared.subscribe(shareSpy);

    fixture.componentRef.setInput('url', 'https://example.com');

    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });

    await component.copyLink();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com');
    expect(shareSpy).toHaveBeenCalledWith('copy');
    expect(component['copySuccess']).toBe(true);
  });

  it('should reset copySuccess after timeout', (done) => {
    fixture.componentRef.setInput('url', 'https://example.com');

    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });

    component.copyLink().then(() => {
      expect(component['copySuccess']).toBe(true);

      setTimeout(() => {
        expect(component['copySuccess']).toBe(false);
        done();
      }, 2100);
    });
  });

  it('should apply correct size classes', () => {
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.share-buttons-small')).toBeTruthy();

    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();
    expect(compiled.querySelector('.share-buttons-large')).toBeTruthy();
  });
});
