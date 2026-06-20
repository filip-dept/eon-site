import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/ui/**/*.stories.tsx'],
  addons: [],
  framework: { name: '@storybook/react-vite', options: {} },
  staticDirs: ['../public'], // serves the EON fonts (@font-face in fonts.css)
  viteFinal: async (cfg) => {
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.alias = { ...(cfg.resolve.alias ?? {}), '@': resolve(here, '../src') };
    return cfg;
  },
};

export default config;
