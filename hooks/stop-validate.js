#!/usr/bin/env node
// Future hook example only. Not wired by default.
import { validate, renderValidation } from '../src/validate.js';
const result = validate(process.cwd());
process.stdout.write(renderValidation(result));
process.exit(result.ok ? 0 : 2);
