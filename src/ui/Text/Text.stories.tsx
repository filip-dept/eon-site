import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';

const meta = {
  title: 'UI/Text',
  component: Text,
  args: { children: 'Ehrlich erklärt, was deinen Tarif besonders macht.' },
  argTypes: {
    variant: { control: 'select', options: ['copy-xl', 'copy-lg', 'copy-md', 'copy-sm', 'abstract-md', 'quote-lg'] },
    weight: { control: 'select', options: ['inherit', 'regular', 'medium', 'bold'] },
    color: { control: 'select', options: ['inherit', 'primary', 'secondary', 'tertiary', 'brand'] },
  },
} satisfies Meta<typeof Text>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Body: Story = { args: { variant: 'copy-md' } };

export const Scale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(['copy-xl', 'copy-lg', 'copy-md', 'copy-sm'] as const).map((v) => (
        <Text key={v} variant={v}>{v} — 100% Ökostrom aus erneuerbaren Quellen</Text>
      ))}
    </div>
  ),
};
