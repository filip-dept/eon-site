import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';

const meta = {
  title: 'UI/Heading',
  component: Heading,
  args: { children: 'Dein Stromtarif, in 15 Sekunden' },
  argTypes: {
    level: { control: 'select', options: [1, 2, 3, 4, 5, 6] },
    size: { control: 'select', options: ['var', 'sm', 'md', 'lg', 'xl', 'xxl'] },
    weight: { control: 'select', options: ['bold', 'medium', 'regular'] },
  },
} satisfies Meta<typeof Heading>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { level: 2 } };

/** Responsive `var` scale — resize the viewport to see each level adapt. */
export const Scale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {([1, 2, 3, 4, 5, 6] as const).map((level) => (
        <Heading key={level} level={level}>Heading {level}</Heading>
      ))}
    </div>
  ),
};
