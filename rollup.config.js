import typescript from 'rollup-plugin-typescript2';

/** @type {import('rollup').RollupOptions}*/
export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
  },
  plugins: [typescript()],
};
