import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
    entry: {
        index: 'src/index.ts',
        io: 'src/io/index.ts',
        promisify: 'src/promisify/index.ts',
        queue: 'src/queue/index.ts',
        stack: 'src/stack/index.ts',
        logger: 'src/logger/index.ts',
        shell: 'src/shell/index.ts',
        storage: 'src/storage/index.ts',
        job: 'src/job/index.ts',
    },
    watch: options.watch ? ['src/**/*'] : false,
    clean: false,
    dts: true, // Generate type declarations
    outDir: 'dist',
    target: 'esnext',
    sourcemap: false,
    format: ['esm', 'cjs'],
    shims: true,
}))
