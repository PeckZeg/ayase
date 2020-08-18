import MockTrigger from '../src/Mock';

import { getMotion } from '../src/utils/legacyUtil';
import { mount } from '@vue/test-utils';

describe('Trigger.Util', () => {
  describe('getMotion', () => {
    const prefixCls = 'test';
    const motion = { motionName: 'motion' };
    const transitionName = 'transition';
    const animation = 'animation';

    it('motion is first', () => {
      expect(
        getMotion({
          prefixCls,
          motion,
          animation,
          transitionName
        })
      ).toEqual({ motionName: 'motion' });
    });

    it('animation is second', () => {
      expect(
        getMotion({
          prefixCls,
          motion: null,
          animation,
          transitionName
        })
      ).toEqual({ motionName: 'test-animation' });
    });

    it('transition is last', () => {
      expect(
        getMotion({
          prefixCls,
          motion: null,
          animation: null,
          transitionName
        })
      ).toEqual({ motionName: 'transition' });
    });
  });

  describe('mock', () => {
    it('close', () => {
      const wrapper = mount({
        render: () => (
          <MockTrigger
            action={['click']}
            popupAlign={{ points: ['cr', 'cl'] }}
            popup={<div>bamboo</div>}
          >
            <div>light</div>
          </MockTrigger>
        )
      });

      expect(wrapper.html()).toEqual('<div>light</div><!---->');
    });

    it('open', () => {
      const wrapper = mount({
        render: () => (
          <MockTrigger
            action={['click']}
            popupAlign={{ points: ['cr', 'cl'] }}
            popup={<div>bamboo</div>}
            popupVisible
          >
            <div>light</div>
          </MockTrigger>
        )
      });

      expect(wrapper.html()).toEqual(
        '<div>light</div><div><!----><div class="vc-trigger-popup" style="opacity: 0;"><div>bamboo</div></div></div>'
      );
    });
  });
});
