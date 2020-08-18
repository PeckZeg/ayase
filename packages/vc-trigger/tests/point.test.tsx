import { TriggerOptions } from '@vue/test-utils/dist/createDomEvent';
import { VueWrapper, mount } from '@vue/test-utils';
import Trigger from '../src';

import { defineComponent } from 'vue';
import _ from 'lodash';

/**
 * dom-align internal default position is `-999`.
 * We do not need to simulate full position, check offset only.
 */
describe('Trigger.Point', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const Demo = defineComponent<any>({
    name: 'Demo',

    render(ctx) {
      return (
        <Trigger
          ref="trigger"
          popup={<div class="point-popup">POPUP</div>}
          popupAlign={{ points: ['tl'] }}
          alignPoint
          {...{ ...ctx.$attrs }}
        >
          <div class="point-region" />
        </Trigger>
      );
    }
  });

  const trigger = async (
    wrapper: VueWrapper<any>,
    eventString: string,
    options?: TriggerOptions
  ) => {
    await wrapper.find('.point-region').trigger(eventString, options);
    jest.runAllTimers();
    await wrapper.vm.$nextTick();
  };

  const getPopup = (wrapper: VueWrapper<any>) =>
    wrapper
      .findComponent({ ref: 'trigger' })
      .findComponent({ ref: 'popupRef' })
      .findComponent({ ref: 'alignRef' })
      .element.parentElement.querySelector<HTMLDivElement>('.vc-trigger-popup');

  it('onClick', async () => {
    const wrapper = mount(Demo, { props: { action: ['click'] } });

    await trigger(wrapper, 'click', { pageX: 10, pageY: 20 });

    const popup = getPopup(wrapper);

    expect(popup.style).toEqual(
      expect.objectContaining({ left: '-989px', top: '-979px' })
    );
  });

  it('hover', async () => {
    const wrapper = mount(Demo, { props: { action: ['hover'] } });

    await trigger(wrapper, 'mouseenter', { pageX: 10, pageY: 20 });

    const popup = getPopup(wrapper);

    expect(popup.style).toEqual(
      expect.objectContaining({ left: '-989px', top: '-979px' })
    );
  });

  describe('contextMenu', () => {
    it('basic', async () => {
      const wrapper = mount(Demo, { props: { action: ['contextMenu'] } });

      await trigger(wrapper, 'contextmenu', { pageX: 10, pageY: 20 });

      const popup = getPopup(wrapper);

      expect(popup.style).toEqual(
        expect.objectContaining({ left: '-989px', top: '-979px' })
      );
    });

    it('not prevent default', async (done) => {
      const wrapper = mount(Demo, {
        props: {
          action: ['contextMenu'],
          hideAction: ['click']
        }
      });

      await trigger(wrapper, 'contextmenu', { pageX: 10, pageY: 20 });

      const popup = getPopup(wrapper);

      expect(popup.style).toEqual(
        expect.objectContaining({ left: '-989px', top: '-979px' })
      );

      await wrapper.find('.point-region').trigger('click', {
        preventDefault() {
          done.fail();
        }
      });

      done();
    });
  });

  describe('placement', () => {
    function testPlacement(name, builtinPlacements, afterAll?) {
      it(name, async (done) => {
        const wrapper = mount(Demo, {
          props: {
            action: ['click'],
            builtinPlacements,
            popupPlacement: 'right'
          }
        });

        await trigger(wrapper, 'click', { pageX: 10, pageY: 20 });
        const popup = getPopup(wrapper);
        const popupStyle = getPopup(wrapper).style;

        expect(popup.style).toEqual(
          expect.objectContaining({ left: '-989px', top: '-979px' })
        );

        if (afterAll) {
          afterAll(wrapper);
        }

        done();
      });
    }

    testPlacement('not hit', {
      right: {
        // This should not hit
        points: ['cl']
      }
    });

    testPlacement(
      'hit',
      {
        left: {
          points: ['tl']
        }
      },

      (wrapper) => {
        expect(getPopup(wrapper).classList).toContain(
          'vc-trigger-popup-placement-left'
        );
      }
    );
  });
});
