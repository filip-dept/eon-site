import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, iconNames } from './Icon';

const meta = {
  title: 'UI/Icon',
  component: Icon,
  argTypes: { name: { control: 'select', options: iconNames } },
} satisfies Meta<typeof Icon>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = { args: { name: 'location' } };

/** The full registry — real E.ON icons (currentColor), shown in brand red. */
export const Gallery: Story = {
  args: { name: 'location' }, // unused by the custom render; satisfies the required prop type
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 20, color: 'var(--brand-red)', maxWidth: 640 }}>
      {iconNames.map((name) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
          <Icon name={name} size={28} />
          <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};
