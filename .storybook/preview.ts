import type { Preview } from '@storybook/react-vite';
import '../src/app/globals.css'; // tokens + Tailwind theme so primitives render on-brand

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { matchers: { color: /(background|color)$/i } },
  },
};

export default preview;
