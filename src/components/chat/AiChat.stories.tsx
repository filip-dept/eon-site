import type { Meta, StoryObj } from '@storybook/react-vite';
import { AiChat, type AiChatSuggestion } from './AiChat';

/**
 * AiChat — the E.ON assistant bubble (Figma "AI chat" 1877:3106), four variants
 * built on <AiOrb>. On the tariff page the `pill` ↔ `answer` states are morphed
 * by GSAP; here each variant is shown statically.
 */
const meta = {
  title: 'Chat/AiChat',
  component: AiChat,
  parameters: { layout: 'centered' },
  argTypes: { variant: { control: 'select', options: ['pill', 'bar', 'suggestions', 'answer'] } },
} satisfies Meta<typeof AiChat>;
export default meta;

type Story = StoryObj<typeof meta>;

const prompt = 'Was beschäftigt dich heute?';

const SUGGESTIONS: AiChatSuggestion[] = [
  { id: 'wallbox', label: 'Wallbox und passender Autostrom-Tarif', interactive: true },
  { id: 'strom-tarif', label: 'Strom-Tarif für mich finden', interactive: true },
  { id: 'solar', label: 'Lohnt sich Solar mit Wärmepumpe?', interactive: true },
  { id: 'kosten', label: 'Wie senke ich meine Energiekosten?', interactive: true },
];

const ANSWER_BODY =
  'Hier kommt ein HEMS (Home Energy Management System) ins Spiel. Über Apps (wie E.ON Home ' +
  'oder Smart Control) siehst du in Echtzeit, welche deiner Geräte wie viel verbrauchen. ' +
  'Stromfresser werden sofort entlarvt. So kannst du deinen Gesamtverbrauch – und damit auch ' +
  'den Bedarf an Erzeugung – nachhaltig senken.';

/** Resting bubble — orb + mic (the consumer grows the prompt on hover). */
export const Pill: Story = { args: { variant: 'pill', prompt } };

/** Full input bar — orb + prompt + mic + send. */
export const Bar: Story = {
  args: { variant: 'bar', prompt },
  render: (args) => <div style={{ width: 465 }}><AiChat {...args} /></div>,
};

/** Hero / homepage — input bar + quick-prompt chips. */
export const Suggestions: Story = {
  args: { variant: 'suggestions', prompt, suggestions: SUGGESTIONS },
  render: (args) => <div style={{ width: 596 }}><AiChat {...args} /></div>,
};

/** Assistant reply — header + answer + input row (auto-opens on the HEMS stage). */
export const Answer: Story = {
  args: {
    variant: 'answer',
    prompt,
    cardWidth: 440,
    answerHeading: 'Du willst das Meiste aus deinem Ökostrom herausholen?',
    answerBody: ANSWER_BODY,
  },
};
