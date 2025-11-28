import type { Meta, StoryObj } from '@storybook/react';
import { Lafufu } from '../components';

const meta: Meta<typeof Lafufu> = {
  title: 'Charms/Lafufu',
  component: Lafufu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Lafufu>;

export const Default: Story = {
  args: {

  },
  render: (args) => <div style={{ width: '20rem', height: '20rem' }}><Lafufu {...args} /></div>,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '5rem', padding: '2rem', height: '30rem' }}>
        <Lafufu size="small" />
      
        <Lafufu size="medium" />
  
        <Lafufu size="large" />
     
    </div>
  ),
};

export const CustomColor: Story = {
  args: {
    color: '#FFB6C1', 
  },
  render: (args) => <div style={{ width: '20rem', height: '20rem' }}><Lafufu {...args} /></div>,
};

export const CustomString: Story = {
  args: {
    string: { length: 200, chainLinks: 30, color: '#cdcdcd' }, 
  },
  render: (args) => <div style={{ width: '20rem', height: '30rem' }}><Lafufu {...args} /></div>,
};

export const InContent: Story = {
  render: () => (
    <div style={{ width: '30rem', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '1rem',flexDirection: 'row', alignItems: 'space-between' }}>
        <button  style={{ position: 'relative', padding: '1rem 3rem', borderRadius: '8px', border: 'none', background: '#dad1d7', fontWeight: 'bold', cursor: 'pointer', fontSize: '20px', color: '#211e22' }}>Button</button>
        <button  style={{ position: 'relative', padding: '1rem 3rem', borderRadius: '8px', border: 'none', background: '#dad1d7', fontWeight: 'bold', cursor: 'pointer', fontSize: '20px', color: '#211e22' }}>Button</button>
        <button style={{ position: 'relative', padding: '1rem 3rem', borderRadius: '8px', border: 'none', background: '#f9bae4', fontWeight: 'bold', cursor: 'pointer', fontSize: '20px', color: '#371f3e' }}>
          <span>Button</span>
          <div style={{position: 'absolute', right: '0', bottom: '0'}}>
            <Lafufu string={{ color: '#371f3e' }} color='#f9bae4' />
          </div>
        </button>
      </div>
        <p>I really believe that if you practice enough you could paint the 'Mona Lisa' with a two-inch brush. We don't need any guidelines or formats. All we need to do is just let it flow right out of us. Every single thing in the world has its own personality - and it is up to you to make friends with the little rascals.</p>
        <p>Here's something that's fun. You can't make a mistake. Anything that happens you can learn to use - and make something beautiful out of it. Now, we're going to fluff this cloud.</p>
        <p>Isn't it fantastic that you can change your mind and create all these happy things? Didn't you know you had that much power? You can move mountains. You can do anything. You're the greatest thing that has ever been or ever will be. You're special. You're so very special. If you don't like it - change it. It's your world. We must be quiet, soft and gentle. Just let go - and fall like a little waterfall.</p>
        <p>See there how easy that is. The man who does the best job is the one who is happy at his job. In life you need colors.</p>
     </div>
  ),
};