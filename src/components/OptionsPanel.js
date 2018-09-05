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

    const click = () => {
        changeColor(color);
    };

    const keyPress = (e: SyntheticKeyboardEvent<>) => {
        if (e.key === 'Enter') {
            click();
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
    hiding: boolean,
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
             role="button" tabIndex={0} aria-label={icon}
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
    removeTodo: (todoId: string) => Promise<string> | void,
    changeColor: (todoId: string, newValue: string) => Promise<void> | void,
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

    handleDelete = () => {
        const {todoId, removeTodo} = this.props;
        removeTodo(todoId);
    };

    handleOpenColorPalette = () => {
        this.setState(prevState => ({
            colorPaletteHiding: !prevState.colorPaletteHiding,
        }));
    };

    handleChangeColor = (newValue: string) => {
        const {todoId, changeColor} = this.props;
        console.log('change color clicked');
        changeColor(todoId, newValue);
    };

    render() {
        const {colorPaletteHiding} = this.state;

        return (
            <div className="todo-options-panel">
                <OptionsPanelButton icon="delete"
                                    tooltipText="Delete"
                                    handleClick={this.handleDelete} />
                <OptionsPanelButton icon="color_lens"
                                    tooltipText="Change color"
                                    handleClick={this.handleOpenColorPalette}>
                    <ColorPalette hiding={colorPaletteHiding}
                                  changeColor={this.handleChangeColor} />
                </OptionsPanelButton>
            </div>
        )
    }
}
