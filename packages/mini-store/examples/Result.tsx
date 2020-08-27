import { connect } from '../src';

export default connect<{}, {}, { count: number }>((state) => ({ count: state.count }))({
  props: ['count'],

  render() {
    return <div>{this.count}</div>;
  }
});
