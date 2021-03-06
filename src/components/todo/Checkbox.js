// @flow

import * as React from 'react';

type CheckboxProps = {
  fakeTdliId: string,
  checked: boolean,
  handleChange: (id: string, newValue: boolean) => void | Promise<void>,
};

type CheckboxStates = {
  checked: boolean,
};

export default class Checkbox extends React.PureComponent<
  CheckboxProps,
  CheckboxStates,
> {
  constructor(props: CheckboxProps) {
    super(props);
    this.state = {
      checked: props.checked,
    };
  }

  handleClick = (e: SyntheticMouseEvent<>) => {
    e.stopPropagation();
  };

  handleChange = () => {
    const { fakeTdliId, handleChange } = this.props;
    const { checked } = this.state;

    handleChange(fakeTdliId, !checked);

    this.setState({
      checked: !checked,
    });
  };

  render() {
    const { checked } = this.state;

    return (
      <input
        type="checkbox"
        checked={checked}
        onClick={this.handleClick}
        onChange={this.handleChange}
      />
    );
  }
}
