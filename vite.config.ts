import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

export default defineConfig({
  // Base URL for the application (optional, but useful if you are deploying to a subdirectory)
  base: './',

  // Root directory of the project
  // root: __dirname,

  // Directory where the built files will be generated
  build: {
    outDir: 'dist',
  },

  // Development server configuration
  server: {
    port: 3000, // Change this if you prefer a different port
  },

  // Plugins used by Vite
  plugins: [reactRefresh()],

  // TypeScript configuration
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },

  // Additional configuration for the bundler (optional)
  // For example, if you want to split your chunks
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'], // Add other dependencies you want to optimize
  },

  // Additional configuration for Vite (optional)
  // For example, if you want to enable CSS modules or change the resolution for extensions
  css: {
    modules: {
      localsConvention: 'camelCase', // Change to 'dashes' if you prefer dashes
    },
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
});
