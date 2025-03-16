/// <reference types="@sveltejs/kit" />

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { User } from '$lib/stores/userStore';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {}
		interface PrivateEnv {
			SELLAPP_API_KEY: string;
		}
		interface PublicEnv {}
	}
}

export {};
