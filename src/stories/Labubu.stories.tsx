import type { Meta, StoryObj } from '@storybook/react';
import { Labubu } from '../components/Labubu';

const meta: Meta<typeof Labubu> = {
  title: 'Charms/Labubu',
  component: Labubu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Labubu>;

export const Default: Story = {
  args: {
    anchorPosition: { x: 200, y: 50 },
  },
};

export const LongString: Story = {
  args: {
    stringLength: 150,
    anchorPosition: { x: 200, y: 50 },
  },
};

export const CustomColor: Story = {
  args: {
    color: '#6B9DFF',
    anchorPosition: { x: 200, y: 50 },
  },
};