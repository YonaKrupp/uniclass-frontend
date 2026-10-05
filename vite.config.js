import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  // Force React + ReactDOM into the same initial dep-optimization pass.
  // Without this, a later-discovered dep can trigger a re-optimization that
  // re-bundles React under a new ?v= hash while React-DOM keeps the old one,
  // producing two separate React module instances and crashing hooks
  // ("Cannot read properties of null (reading 'useState')").
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client']
  },
  // Deduplicate React/ReactDOM so every importer — including transitive deps
  // that bundle their own copy — resolves to the single shared instance.
  // This is the canonical fix for "Cannot read properties of null (reading 'useState')"
  // caused by duplicate React module instances in the dev dep graph.
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ]
});