import { animate, style, transition, trigger } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('300ms', style({ opacity: 0 })),
  ]),
]);

export const slideInAnimation = trigger('slideInAnimation', [
  transition(':enter', [
    style({ transform: 'translateY(20px)', opacity: 0 }),
    animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
  ]),
]);

export const listAnimation = trigger('listAnimation', [
  transition(':enter', [
    style({ transform: 'translateX(-10px)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
]);