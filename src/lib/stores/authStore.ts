import { writable } from 'svelte/store';

export interface User {
    id: string;
    email: string;
}

export const user = writable<User | null>(null); 