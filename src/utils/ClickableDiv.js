// @flow

import * as React from 'react';

type ClickableDivProps = {
    children?: React.Node,
    handleClick?: (e: SyntheticEvent<>) => mixed,
}

export default function ClickableDiv(props: ClickableDivProps) {
    const {children, handleClick, ...rest} = props;

    const click = (e: SyntheticMouseEvent<>) => {
        if (handleClick) {
            handleClick(e);
        }
    };

    const keyPress = (e: SyntheticKeyboardEvent<>) => {
        if (e.key === 'Enter') {
            if (handleClick) {
                handleClick(e);
            }
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
