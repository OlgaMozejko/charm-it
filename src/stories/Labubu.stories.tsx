import type { Meta, StoryObj } from '@storybook/react';
import { Labubu } from '../components/Labubu';

const meta: Meta<typeof Labubu> = {
  title: 'Charms/Labubu',
  component: Labubu,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Labubu>;

export const Default: Story = {
  args: {},
};

export const Large: Story = {
  args: {
    size: 80,
  },
};

export const CustomColor: Story = {
  args: {
    color: '#6B9DFF',
  },
};