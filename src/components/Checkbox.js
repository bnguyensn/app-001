// @flow

import * as React from 'react';

type CheckboxProps = {
    id?: string,
    className?: string,
    elKey?: string,
    checked?: boolean,
    handleChange?: (key: string, newValue: boolean) => void,
};

type CheckboxStates = {
    checked: boolean,
};

export default class Checkbox extends React.PureComponent<CheckboxProps, CheckboxStates> {
    constructor(props: CheckboxProps) {
        super(props);
        this.state = {
            checked: props.checked || false,
        };
    }

    handleChange = () => {
        const {elKey, handleChange} = this.props;
        const {checked: curChecked} = this.state;
        if (handleChange) {
            const key = elKey || '';
            handleChange(key, !curChecked);
        }
        this.setState({
            checked: !curChecked,
        });
    };

    render() {
        const {className, id} = this.props;
        const {checked} = this.state;

        return (
            <input id={id || ''}
                   className={className || ''}
                   type="checkbox"
                   checked={checked}
                   onChange={this.handleChange} />
        )
    }
}
