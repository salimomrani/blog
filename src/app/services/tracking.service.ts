import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TrackEvent {
  type: 'pageView' | 'linkClick';
  page?: string;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseApiUrl}/tracking`;

  public trackEvent(event: TrackEvent): Observable<void> {
    return this.http.post<void>(this.baseUrl, event);
  }
}
