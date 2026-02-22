import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  private counter = 1;

  messages$ = this.messagesSubject.asObservable();

  show(message: string, type: ToastType = 'info'): void {
    const entry: ToastMessage = { id: this.counter++, type, message };
    const next = [...this.messagesSubject.value, entry];
    this.messagesSubject.next(next);

    setTimeout(() => this.remove(entry.id), 3000);
  }

  remove(id: number): void {
    this.messagesSubject.next(this.messagesSubject.value.filter(item => item.id !== id));
  }
}
