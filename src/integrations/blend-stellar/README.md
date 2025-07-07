# Blend-Stellar Integration

This directory contains all code for integrating Blend Protocol with the Paylancer application.

## Structure

- `sdk/` - Blend SDK wrappers
- `services/` - Business logic for pools, users, backstop
- `hooks/` - React hooks for UI integration
- `components/` - UI components/widgets
- `utils/` - Utility functions
- `types/` - TypeScript types/interfaces
- `config/` - Configuration and feature toggles
- `index.ts` - Main entry point

## Removal

To remove the integration, delete this directory and remove any imports/usages in the main app.

## Feature Toggle

Set `REACT_APP_BLEND_FEATURE_ENABLED=false` in your environment to disable Blend features.
