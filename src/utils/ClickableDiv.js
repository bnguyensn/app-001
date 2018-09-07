// @flow

import * as React from 'react';

export default function ClickableDiv(props: {children?: React.Node, handleClick?: () => mixed}) {
    const {children, handleClick, ...rest} = props;

    const click = () => {
        if (handleClick) {
            handleClick();
        }
    };

    const keyPress = (e: SyntheticKeyboardEvent<>) => {
        if (e.key === 'Enter') {
            click();
        }
    };

    return (
        <div {...rest}
             role="presentation"
             onClick={click}
             onKeyPress={keyPress}>
            {children || false}
        </div>
    )
}
