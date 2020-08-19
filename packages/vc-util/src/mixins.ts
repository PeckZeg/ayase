import _ from 'lodash';

function getComponentStaticMethod<T = any>(
  instance: any,
  methodName: string
): T {
  return instance.$.type[methodName];
}

export const DerivedStateFromPropsMixin = {
  created() {
    const getDerivedStateFromProps = getComponentStaticMethod(
      this,
      'getDerivedStateFromProps'
    );

    this.prevState = { ...this.state };

    const newState = getDerivedStateFromProps.call(
      this,
      this.$props,
      this.prevState
    );

    if (!_.isEqual(this.state, newState)) {
      this.state = newState;
    }
  },

  beforeUpdate() {
    const getDerivedStateFromProps = getComponentStaticMethod(
      this,
      'getDerivedStateFromProps'
    );

    this.prevState = { ...this.state };

    const newState = getDerivedStateFromProps.call(
      this,
      this.$props,
      this.prevState
    );

    if (!_.isEqual(this.state, newState)) {
      this.state = newState;
    }
  }
};
