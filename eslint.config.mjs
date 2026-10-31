import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

// eslint-config-next bundles eslint-plugin-react-hooks (rules-of-hooks, exhaustive-deps).
export default defineConfig([...nextVitals, globalIgnores(['.next/**'])]);
