import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Patch pour Node < 19 (TextEncoder/TextDecoder non globaux)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Pas besoin de recréer manuellement un JSDOM ici,
// Jest le fait déjà avec `testEnvironment: 'jsdom'`.
