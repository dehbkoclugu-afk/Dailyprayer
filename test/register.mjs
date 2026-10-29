// Lets node:test import app modules that use the "@/…" alias, JSON imports and
// React Native-only packages (swapped for small in-memory mocks).
import { register } from 'node:module';

register('./loader.mjs', import.meta.url);
