import VcAlign from '../src';

import { mount } from '@vue/test-utils';
import { h } from 'vue';

describe('point align', () => {
  it('not pass point', () => {
    const wrapper = mount(VcAlign, {
      slots: {
        default: () =>
          h('div', {
            style: { width: '20px', height: '20px', position: 'fixed' }
          })
      }
    });

    expect(wrapper.emitted()).not.toHaveProperty('align');
  });

  it('pass point', async () => {
    jest.useFakeTimers();
    const wrapper = mount(VcAlign, {
      props: {
        align: { points: ['tc'] },
        target: null
      },

      slots: {
        default: () =>
          h('div', {
            style: { width: '20px', height: '20px', position: 'fixed' }
          })
      }
    });

    expect(wrapper.emitted()).not.toHaveProperty('align');
    await wrapper.setProps({ target: { pageX: 1128, pageY: 903 } });
    jest.runAllTimers();
    expect(wrapper.emitted()).toHaveProperty('align');
    jest.useRealTimers();
  });
});
