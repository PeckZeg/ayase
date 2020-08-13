import ElementTest from './ElementTest.vue';

import { mount } from '@vue/test-utils';

describe('element align', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resize', async () => {
    const wrapper = mount(ElementTest, {
      props: { monitorWindowResize: true }
    });

    jest.runAllTimers();
    expect(wrapper.emitted()).toHaveProperty('align');

    // Window resize
    window.dispatchEvent(new Event('resize'));
    jest.runAllTimers();
    expect(wrapper.emitted('align')).toHaveLength(2);

    // Not listen resize
    await wrapper.setProps({ monitorWindowResize: false });
    window.dispatchEvent(new Event('resize'));
    jest.runAllTimers();
    expect(wrapper.emitted('align')).toHaveLength(2);

    // Remove should not crash
    await wrapper.setProps({ monitorWindowResize: true });
    wrapper.unmount();
  });

  it('disabled should trigger align', async () => {
    const wrapper = mount(ElementTest, {
      props: { monitorWindowResize: true, disabled: true }
    });

    jest.runAllTimers();
    expect(wrapper.emitted()).not.toHaveProperty('align');

    await wrapper.setProps({ disabled: false });
    jest.runAllTimers();
    expect(wrapper.emitted()).toHaveProperty('align');
  });
});
