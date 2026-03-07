import { expect } from 'bun:test'; // <--- Change this line
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import * as matchers from '@testing-library/jest-dom/matchers';

// 1. Register the DOM environment
GlobalRegistrator.register();

// 2. Add the "toBeInTheDocument" and other matchers
expect.extend(matchers);
