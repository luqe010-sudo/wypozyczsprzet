import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextCoreWebVitals,
  {
    rules: {
      // Reading the URL or localStorage on mount is the intended way to keep server HTML stable.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'scratch/**', 'public/**'],
  },
];

export default config;
