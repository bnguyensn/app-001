// @flow

import * as React from 'react';
import MaterialIcon from './MaterialIcon';
import COLORS from '../utils/colors.json';

import './css/options-panel.css';

/** ********** OPTIONS PANEL COLOR PALETTE ********** **/

function ColorButton(props: {color: string}) {
    const {color} = props;

    return (
        <div className="todo-options-panel-color-palette-btn"
             style={{backgroundColor: color}} />
    )
}

class ColorPalette extends React.PureComponent<{hiding: boolean}, {}> {
    colorButtons: React.Node[];

    constructor(props: {hiding: boolean}) {
        super(props);
        const colors = Object.keys(COLORS);
        this.colorButtons = colors.map(color => (
            <ColorButton key={color} color={COLORS[color]} />
        ));
    }

    render() {
        const {hiding} = this.props;

        const hiddenCls = hiding ? 'hide' : '';

        return (
            <div className={`todo-options-panel-color-palette ${hiddenCls}`}>
                {this.colorButtons}
            </div>
        )
    }
}

/** ********** OPTIONS PANEL BUTTON TOOLTIP ********** **/

function OptionsPanelButtonTooltip(props: {text: string}) {
    const {text} = props;

    return (
        <div className="todo-options-panel-btn-tooltip">
            {text}
        </div>
    )
}

/** ********** OPTIONS PANEL BUTTON ********** **/

type OptionsPanelButtonProps = {
    icon: string,  // Material icon code
    tooltipText: string,
    handleClick?: () => void,
    children?: React.Node
};

function OptionsPanelButton(props: OptionsPanelButtonProps) {
    const {icon, tooltipText, handleClick, children} = props;

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
        <div className="todo-options-panel-btn"
             role="button" tabIndex={0}
             onClick={handleClick}
             onKeyPress={keyPress}>
            <MaterialIcon className="md-dark" icon={icon} />
            <OptionsPanelButtonTooltip text={tooltipText} />
            {children || false}
        </div>
    )
}

/** ********** OPTIONS PANEL ********** **/

type OptionsPanelProps = {
    todoId: string,
    removeTodo: (todoId?: string) => Promise<string> | void,
};

type OptionsPanelStates = {
    colorPaletteHiding: boolean,
};

export default class OptionsPanel extends React.PureComponent<OptionsPanelProps, OptionsPanelStates> {
    constructor(props: OptionsPanelProps) {
        super(props);
        this.state = {
            colorPaletteHiding: true,
        };
    }

    handleDeleteClick = () => {
        const {todoId, removeTodo} = this.props;

        if (todoId) {
            removeTodo(todoId);
        } else {
            removeTodo();
        }

    };

    handleChangeColorClick = () => {
        this.setState(prevState => ({
            colorPaletteHiding: !prevState.colorPaletteHiding,
        }));
    };

    render() {
        const {colorPaletteHiding} = this.state;

        return (
            <div className="todo-options-panel">
                <OptionsPanelButton icon="delete"
                                    tooltipText="Delete"
                                    handleClick={this.handleDeleteClick} />
                <OptionsPanelButton icon="color_lens"
                                    tooltipText="Change color"
                                    handleClick={this.handleChangeColorClick}>
                    <ColorPalette hiding={colorPaletteHiding} />
                </OptionsPanelButton>
            </div>
        )
    }
}
