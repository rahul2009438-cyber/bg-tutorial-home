import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('dexie')) return 'vendor-dexie';
            if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
            return 'vendor-libs';
          }
          if (id.includes('TeacherWorkspace') || id.includes('UnifiedBatchManager') || id.includes('AcademicAnalytics') || id.includes('DatabaseHealthCenter')) {
            return 'teacher-workspace-bundle';
          }
        }
      }
    }
  }
});
