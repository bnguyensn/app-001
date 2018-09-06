// @flow

import * as React from 'react';
import './css/text-edit.css';

type TextEditProps = {
    id?: string,
    className?: string,
    placeholder?: string,
    textEditKey?: string,
    initText?: string,
    handleInput?: (key: string, newValue: string, textEditEL: Node) => void,
    handleBlur?: (key: string, curValue: string) => void,
};

export default class TextEdit extends React.PureComponent<TextEditProps, {}> {
    el: { current: null | HTMLDivElement };

    constructor(props: TextEditProps) {
        super(props);
        this.el = React.createRef();
    }

    componentDidMount() {
        const {initText} = this.props;
        if (initText && this.el.current) {
            this.el.current.textContent += initText;
        }
    }

    handleInput = (e: SyntheticInputEvent<HTMLDivElement>) => {
        const {textEditKey, handleInput} = this.props;
        if (textEditKey && handleInput) {
            const key = textEditKey || '';
            handleInput(key, e.currentTarget.textContent, e.currentTarget);
        }
    };

    handleBlur = (e: SyntheticInputEvent<HTMLDivElement>) => {
        const {textEditKey, handleBlur} = this.props;
        if (handleBlur) {
            const key = textEditKey || '';
            handleBlur(key, e.currentTarget.textContent);
        }
    };

    render() {
        const {className, id, placeholder} = this.props;

        return (
            <div ref={this.el}
                 id={id || ''}
                 className={`text-edit ${className || ''}`}
                 placeholder={placeholder || 'Type something...'}
                 onInput={this.handleInput}
                 onBlur={this.handleBlur}
                 contentEditable />
        )
    }
}
