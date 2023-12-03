/* eslint-disable import/no-default-export -- rollup config */
import typescript from 'rollup-plugin-typescript2';

const adapters = ['node-redis', 'node-redis-cluster', 'vercel-kv', 'upstash'];

/** @type {import('rollup').RollupOptions}*/
export default {
  input: [
    'src/index.ts',
    ...adapters.map((adapter) => `src/adapters/${adapter}.ts`),
  ],
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [typescript()],
};
