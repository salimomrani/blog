import { TestBed } from '@angular/core/testing';
import { TokenRefreshService } from './token-refresh.service';
import { firstValueFrom } from 'rxjs';

describe('TokenRefreshService', () => {
  let service: TokenRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should not be refreshing initially', () => {
      expect(service.isCurrentlyRefreshing()).toBe(false);
    });

    it('should have isRefreshing computed signal as false initially', () => {
      expect(service.isRefreshing()).toBe(false);
    });
  });

  describe('startRefreshing', () => {
    it('should set isRefreshing to true', () => {
      service.startRefreshing();
      expect(service.isCurrentlyRefreshing()).toBe(true);
      expect(service.isRefreshing()).toBe(true);
    });
  });

  describe('completeRefresh', () => {
    it('should set isRefreshing to false', () => {
      service.startRefreshing();
      service.completeRefresh('new-token');
      expect(service.isCurrentlyRefreshing()).toBe(false);
      expect(service.isRefreshing()).toBe(false);
    });

    it('should emit the new token through refreshedToken$', (done) => {
      const newToken = 'new-access-token';

      service.refreshedToken$.subscribe((token) => {
        expect(token).toBe(newToken);
        done();
      });

      service.completeRefresh(newToken);
    });

    it('should emit multiple tokens sequentially', async () => {
      const tokens: string[] = [];

      service.refreshedToken$.subscribe((token) => {
        tokens.push(token);
      });

      service.completeRefresh('token-1');
      service.completeRefresh('token-2');
      service.completeRefresh('token-3');

      // Small delay to ensure all emissions are processed
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(tokens).toEqual(['token-1', 'token-2', 'token-3']);
    });
  });

  describe('failRefresh', () => {
    it('should set isRefreshing to false', () => {
      service.startRefreshing();
      service.failRefresh();
      expect(service.isCurrentlyRefreshing()).toBe(false);
      expect(service.isRefreshing()).toBe(false);
    });
  });

  describe('refresh workflow', () => {
    it('should handle complete refresh workflow', async () => {
      // Initially not refreshing
      expect(service.isCurrentlyRefreshing()).toBe(false);

      // Start refresh
      service.startRefreshing();
      expect(service.isCurrentlyRefreshing()).toBe(true);

      // Complete refresh
      const newToken = 'refreshed-token';
      const tokenPromise = firstValueFrom(service.refreshedToken$);
      service.completeRefresh(newToken);

      // Should emit token and stop refreshing
      const emittedToken = await tokenPromise;
      expect(emittedToken).toBe(newToken);
      expect(service.isCurrentlyRefreshing()).toBe(false);
    });

    it('should handle failed refresh workflow', () => {
      // Start refresh
      service.startRefreshing();
      expect(service.isCurrentlyRefreshing()).toBe(true);

      // Fail refresh
      service.failRefresh();
      expect(service.isCurrentlyRefreshing()).toBe(false);
    });
  });

  describe('concurrent refresh scenarios', () => {
    it('should allow checking refresh state multiple times', () => {
      service.startRefreshing();

      // Multiple checks should return consistent state
      expect(service.isCurrentlyRefreshing()).toBe(true);
      expect(service.isCurrentlyRefreshing()).toBe(true);
      expect(service.isRefreshing()).toBe(true);

      service.completeRefresh('token');

      expect(service.isCurrentlyRefreshing()).toBe(false);
      expect(service.isCurrentlyRefreshing()).toBe(false);
      expect(service.isRefreshing()).toBe(false);
    });
  });
});
