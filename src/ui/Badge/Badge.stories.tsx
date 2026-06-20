import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
import { Icon } from '@/ui/Icon';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  args: { children: 'Besonders nachhaltig' },
  argTypes: { tone: { control: 'select', options: ['success', 'brand', 'neutral'] } },
} satisfies Meta<typeof Badge>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = { args: { tone: 'success', iconLeft: <Icon name="leaf" /> } };
export const Brand: Story = { args: { tone: 'brand', children: 'Unsere Empfehlung für dich' } };
export const Neutral: Story = { args: { tone: 'neutral', children: 'Standard' } };
