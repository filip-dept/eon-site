import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Icon } from '@/ui/Icon';

const meta = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Tarif auswählen' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'outline-light', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Outline: Story = { args: { variant: 'outline', iconRight: <Icon name="chevron-right" />, children: 'Tarif vergleichen' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Mehr erfahren' } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args} size="sm" />
      <Button {...args} size="md" />
      <Button {...args} size="lg" />
    </div>
  ),
};

/** Light variants live on the red panel — shown here on a brand background. */
export const OnBrand: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, padding: 24, background: 'var(--brand-red)' }}>
      <Button variant="outline-light">Mehr entdecken</Button>
      <Button variant="ghost">Überspringen</Button>
    </div>
  ),
};
