import CSSMotion, { CSSMotionProps, genCSSMotion } from '../src/CSSMotion';
import { ComponentPublicInstance, defineComponent } from 'vue';

import { mount } from '@vue/test-utils';

describe('CSSMotion', () => {
  const CSSMotion = genCSSMotion(true);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('transition', () => {
    function onCollapse() {
      return { height: '0px' };
    }
    function onExpand() {
      return { height: '100px' };
    }

    const actionList: {
      name: string;
      props: any;
      visible: boolean[];
      oriHeight: string;
      tgtHeight: string;
    }[] = [
      {
        name: 'appear',
        props: {
          motionAppear: true,
          onAppearStart: onCollapse,
          onAppearActive: onExpand
        },
        visible: [true],
        oriHeight: '0px',
        tgtHeight: '100px'
      },
      {
        name: 'enter',
        props: {
          motionEnter: true,
          onEnterStart: onCollapse,
          onEnterActive: onExpand
        },
        visible: [false, true],
        oriHeight: '0px',
        tgtHeight: '100px'
      },
      {
        name: 'leave',
        props: {
          motionLeave: true,
          onLeaveStart: onExpand,
          onLeaveActive: onCollapse
        },
        visible: [true, false],
        oriHeight: '100px',
        tgtHeight: '0px'
      }
    ];

    actionList.forEach(({ name, props, visible, oriHeight, tgtHeight }) => {
      const Demo = defineComponent({
        props: {
          visible: { type: Boolean, default: visible[0] }
        },

        render() {
          const motionProps = Object.assign(
            {
              motionName: 'transition',
              motionAppear: false,
              motionEnter: false,
              motionLeave: false,
              visible: this.visible
            },
            props
          );

          return (
            <CSSMotion
              ref="CSSMotion"
              {...motionProps}
              v-slots={{
                default: (props) => <div class="motion-box" {...props} />
              }}
            />
          );
        }
      });

      it(name, async () => {
        const nextVisible = visible[1];
        const wrapper = mount(Demo);

        async function doStartTest() {
          await wrapper.vm.$nextTick();
          const boxNode = wrapper.find<HTMLDivElement>('.motion-box');
          expect(boxNode.classes()).toContain('transition');
          expect(boxNode.classes()).toContain(`transition-${name}`);
          expect(boxNode.classes()).not.toContain(`transition-${name}-active`);
          expect(boxNode.element.style.height).toEqual(oriHeight);

          // Motion active
          jest.runAllTimers();
          wrapper.vm.$.update();
          await wrapper.vm.$nextTick();
          const activeBoxNode = wrapper.find<HTMLDivElement>('.motion-box');
          expect(activeBoxNode.classes()).toContain('transition');
          expect(activeBoxNode.classes()).toContain(`transition-${name}`);
          expect(activeBoxNode.classes()).toContain(
            `transition-${name}-active`
          );
          expect(activeBoxNode.element.style.height).toEqual(tgtHeight);

          // Motion end
          jest.useFakeTimers();
          const component = wrapper.findComponent<
            ComponentPublicInstance<{}, {}, {}, {}, { onMotionEnd: () => void }>
          >({ ref: 'CSSMotion' });
          component.vm.onMotionEnd();
          component.vm.$forceUpdate();
          jest.runAllTimers();
          await component.vm.$nextTick();

          if (nextVisible === false) {
            expect(wrapper.find('.motion-box').exists()).toBeFalsy();
          } else {
            const finalBoxNode = wrapper.find<HTMLDivElement>('.motion-box');
            expect(finalBoxNode.classes()).not.toContain('transition');
            expect(finalBoxNode.classes()).not.toContain(`transition-${name}`);
            expect(finalBoxNode.classes()).not.toContain(
              `transition-${name}-active`
            );
            expect(Boolean(finalBoxNode.element.style.length)).toBeFalsy();
          }
        }

        // Delay for the visible finished
        if (nextVisible !== undefined) {
          await wrapper.setProps({ visible: nextVisible });
          doStartTest();
        } else {
          doStartTest();
        }
      });
    });

    const CSSMotionWrapper = defineComponent<CSSMotionProps>({
      render(ctx) {
        return (
          <CSSMotion
            {...ctx.$attrs}
            v-slots={{
              default: (props) => <div {...props} class="motion-box" />
            }}
          />
        );
      }
    });

    it('stop transition if config motion to false', async () => {
      const wrapper = mount(CSSMotionWrapper, {
        props: {
          motionName: 'transition',
          visible: true
        }
      });

      wrapper.vm.$.update();
      await wrapper.vm.$nextTick();

      let boxNode = wrapper.find('.motion-box');
      expect(boxNode.classes()).toContain('transition');
      expect(boxNode.classes()).toContain('transition-appear');
      expect(boxNode.classes()).not.toContain('transition-appear-active');

      await wrapper.setProps({ motionAppear: false });
      jest.runAllTimers();
      boxNode = wrapper.find('.motion-box');
      expect(boxNode.classes()).not.toContain('transition');
      expect(boxNode.classes()).not.toContain('transition-appear');
      expect(boxNode.classes()).not.toContain('transition-appear-active');
    });

    it('quick switch should have correct status', async () => {
      const wrapper = mount(CSSMotionWrapper, {
        props: {
          motionName: 'transition'
        }
      });

      await wrapper.setProps({ visible: true });
      jest.runAllTimers();
      await wrapper.setProps({ visible: false });

      const boxNode = wrapper.find('.motion-box');
      expect(boxNode.classes()).toContain('transition');
      expect(boxNode.classes()).toContain('transition-leave');
      expect(boxNode.classes()).not.toContain('transition-leave-active');
    });

    it('deadline should work', async () => {
      const onAppearEnd = jest.fn();

      const wrapper = mount(
        defineComponent<CSSMotionProps>({
          render(ctx) {
            return (
              <CSSMotion
                {...ctx.$attrs}
                v-slots={{
                  default: (props) => <div {...props} class="motion-box" />
                }}
              />
            );
          }
        }),
        {
          props: {
            motionName: 'transition',
            motionDeadline: 1000,
            visible: true,
            onAppearEnd
          } as CSSMotionProps
        }
      );

      expect(onAppearEnd).not.toHaveBeenCalled();
      await wrapper.vm.$nextTick();
      jest.runAllTimers();
      await wrapper.vm.$nextTick();
      expect(onAppearEnd).toHaveBeenCalled();
    });
  });

  describe('animation', () => {
    const actionList = [
      {
        name: 'appear',
        props: { motionAppear: true },
        visible: [true]
      },
      {
        name: 'enter',
        props: { motionEnter: true },
        visible: [false, true]
      },
      {
        name: 'leave',
        props: { motionLeave: true },
        visible: [true, false]
      }
    ];

    actionList.forEach(({ name, visible, props }) => {
      const Demo = defineComponent<CSSMotionProps>({
        render() {
          return (
            <CSSMotion
              {...Object.assign(
                {
                  motionName: 'animation',
                  motionAppear: false,
                  motionEnter: false,
                  motionLeave: false,
                  visible: visible[0]
                },
                props,
                this.$attrs
              )}
              v-slots={{
                default: (props) => <div class="motion-box" {...props} />
              }}
            />
          );
        }
      });

      it(name, async () => {
        const wrapper = mount(Demo);
        const nextVisible = visible[1];

        // Delay for the visible finished
        if (nextVisible !== undefined) {
          await wrapper.setProps({ visible: nextVisible });
        }

        await wrapper.vm.$nextTick();
        const boxNode = wrapper.find('.motion-box');

        expect(boxNode.classes()).toContain('animation');
        expect(boxNode.classes()).toContain(`animation-${name}`);
        expect(boxNode.classes()).not.toContain(`animation-${name}-active`);

        // Motion active
        jest.runAllTimers();
        await wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();
        const activeBoxNode = wrapper.find('.motion-box');
        expect(activeBoxNode.classes()).toContain('animation');
        expect(activeBoxNode.classes()).toContain(`animation-${name}`);
        expect(activeBoxNode.classes()).toContain(`animation-${name}-active`);
      });
    });
  });

  describe('immediately', () => {
    it('motionLeaveImmediately', async () => {
      const wrapper = mount(
        defineComponent<CSSMotionProps>({
          props: CSSMotion.props,

          render(ctx) {
            return (
              <CSSMotion
                {...ctx.$props}
                v-slots={{
                  default: (props) => <div {...props} class="motion-box" />
                }}
              />
            );
          }
        }),
        {
          props: {
            motionName: 'transition',
            motionLeaveImmediately: true,
            visible: false
          }
        }
      );

      const boxNode = wrapper.find('.motion-box');
      expect(boxNode.classes()).toContain('transition');
      expect(boxNode.classes()).toContain('transition-leave');
      expect(boxNode.classes()).not.toContain('transition-leave-active');

      // Motion active
      await wrapper.vm.$nextTick();
      jest.runAllTimers();
      await wrapper.vm.$nextTick();

      const activeBoxNode = wrapper.find('.motion-box');
      expect(boxNode.classes()).toContain('transition');
      expect(boxNode.classes()).toContain('transition-leave');
      expect(boxNode.classes()).toContain('transition-leave-active');
    });
  });

  it('no transition', async () => {
    const NoCSSTransition = genCSSMotion(false);

    const wrapper = mount(() => (
      <NoCSSTransition
        motionName="transition"
        v-slots={{ default: (props) => <div {...props} class="motion-box" /> }}
      />
    ));

    const boxNode = wrapper.find('.motion-box');
    expect(boxNode.classes()).not.toContain('transition');
    expect(boxNode.classes()).not.toContain('transition-appear');
    expect(boxNode.classes()).not.toContain('transition-appear-active');
  });
});
