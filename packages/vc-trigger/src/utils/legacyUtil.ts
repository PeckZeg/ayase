import { AnimationType, TransitionNameType } from '../interface';
import { CSSMotionProps } from '@ayase/vc-motion';

interface GetMotionProps {
  motion: CSSMotionProps;
  animation: AnimationType;
  transitionName: TransitionNameType;
  prefixCls: string;
}

export function getMotion({
  prefixCls,
  motion,
  animation,
  transitionName
}: GetMotionProps): CSSMotionProps {
  if (motion) {
    return motion;
  }

  if (animation) {
    return {
      motionName: `${prefixCls}-${animation}`
    };
  }

  if (transitionName) {
    return {
      motionName: transitionName
    };
  }

  return null;
}
