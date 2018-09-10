// @flow

import * as React from 'react';

type CheckboxProps = {
    fakeTdliId: string,
    checked: boolean,
    handleChange: (key: string, newValue: boolean) => void,
};

type CheckboxStates = {
    checked: boolean,
};

export default class Checkbox extends React.PureComponent<CheckboxProps, CheckboxStates> {
    constructor(props: CheckboxProps) {
        super(props);
        this.state = {
            checked: props.checked,
        };
    }

    handleChange = () => {
        const {fakeTdliId, handleChange} = this.props;
        const {checked} = this.state;

        handleChange(fakeTdliId, !checked);

        this.setState({
            checked: !checked,
        });
    };

    render() {
        const {checked} = this.state;

        return (
            <input type="checkbox"
                   checked={checked}
                   onChange={this.handleChange} />
        )
    }
}
