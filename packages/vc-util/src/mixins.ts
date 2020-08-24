function getComponentStaticMethod<T = Function>(
  instance: any,
  methodName: string
): T | undefined {
  return instance.$.type[methodName];
}

export const DerivedStateFromPropsMixin = {
  created() {
    const getDerivedStateFromProps = getComponentStaticMethod(
      this,
      'getDerivedStateFromProps'
    );

    this.prevState = { ...this.state };

    Object.assign(
      this.state,
      getDerivedStateFromProps.call(this, this.$props, this.prevState)
    );
  },

  beforeUpdate() {
    const getDerivedStateFromProps = getComponentStaticMethod(
      this,
      'getDerivedStateFromProps'
    );

    this.prevState = { ...this.state };

    Object.assign(
      this.state,
      getDerivedStateFromProps.call(this, this.$props, this.prevState)
    );
  }
};
