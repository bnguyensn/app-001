// @flow

import * as React from 'react';
import MaterialIcon from './MaterialIcon';
import COLORS from '../utils/colors.json';

import './css/options-panel.css';

/** ********** OPTIONS PANEL COLOR PALETTE ********** **/

type ColorButtonProps = {
    color: string,
    changeColor: (newValue: string) => void,
};

function ColorButton(props: ColorButtonProps) {
    const {color, changeColor} = props;

    const click = (e: SyntheticMouseEvent<>) => {
        e.stopPropagation();
        changeColor(color);
    };

    const keyPress = (e: SyntheticKeyboardEvent<>) => {
        if (e.key === 'Enter') {
            e.stopPropagation();
            changeColor(color);
        }
    };

    return (
        <div className="todo-options-panel-color-palette-btn"
             role="button" tabIndex={0} aria-label={`Change color to ${color}`}
             style={{backgroundColor: color}}
             onClick={click}
             onKeyPress={keyPress} />
    )
}

type ColorPaletteProps = {
    hidden: boolean,
    changeColor: (newValue: string) => void,
};

class ColorPalette extends React.PureComponent<ColorPaletteProps, {}> {
    colorButtons: React.Node[];

    constructor(props: ColorPaletteProps) {
        super(props);
        const colors = Object.keys(COLORS);
        this.colorButtons = colors.map(color => (
            <ColorButton key={color}
                         color={COLORS[color]}
                         changeColor={props.changeColor} />
        ));
    }

    render() {
        const {hidden} = this.props;

        const hiddenCls = hidden ? 'hide' : '';

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

    const click = (e: SyntheticMouseEvent<>) => {
        e.stopPropagation();
        if (handleClick) {
            handleClick();
        }
    };

    const keyPress = (e: SyntheticKeyboardEvent<>) => {
        if (e.key === 'Enter') {
            e.stopPropagation();
            if (handleClick) {
                handleClick();
            }
        }
    };

    return (
        <div className="todo-options-panel-btn"
             role="button" tabIndex={0} aria-label={icon}
             onClick={click}
             onKeyPress={keyPress}>
            <MaterialIcon className="md-dark" icon={icon} />
            <OptionsPanelButtonTooltip text={tooltipText} />
            {children || false}
        </div>
    )
}

/** ********** OPTIONS PANEL ********** **/

type OptionsPanelProps = {
    tdId: string,
    changeColor: (tdId: string, newValue: string) => Promise<void> | void,
    removeTodo: (tdId: string) => Promise<string> | void,
    close?: (tdId: string) => Promise<void> | void,
};

type OptionsPanelStates = {
    colorPaletteHidden: boolean,
};

export default class OptionsPanel extends React.PureComponent<OptionsPanelProps, OptionsPanelStates> {
    constructor(props: OptionsPanelProps) {
        super(props);
        this.state = {
            colorPaletteHidden: true,
        };
    }

    handleDelete = () => {
        const {tdId, removeTodo} = this.props;
        removeTodo(tdId);
    };

    handleOpenColorPalette = () => {
        this.setState(prevState => ({
            colorPaletteHidden: !prevState.colorPaletteHidden,
        }));
    };

    handleChangeColor = (newValue: string) => {
        const {tdId, changeColor} = this.props;
        changeColor(tdId, newValue);
    };

    handleClose = () => {
        const {tdId, close} = this.props;
        if (close) {
            close(tdId);
        }
    };

    render() {
        const {close} = this.props;
        const {colorPaletteHidden} = this.state;

        return (
            <div className="todo-options-panel">
                <OptionsPanelButton icon="delete"
                                    tooltipText="Delete"
                                    handleClick={this.handleDelete} />
                <OptionsPanelButton icon="color_lens"
                                    tooltipText="Change color"
                                    handleClick={this.handleOpenColorPalette}>
                    <ColorPalette hidden={colorPaletteHidden}
                                  changeColor={this.handleChangeColor} />
                </OptionsPanelButton>
                {close
                    ? (
                        <OptionsPanelButton icon="close"
                                            tooltipText="Close"
                                            handleClick={this.handleClose} />
                    )
                    : null}
            </div>
        )
    }
}
