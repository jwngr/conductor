import type {MouseEvent as ReactMouseEvent, ReactNode} from 'react';

export type MouseEvent<T extends HTMLElement> = ReactMouseEvent<T>;

export type WithChildren<T = unknown> = T & {readonly children: ReactNode};
