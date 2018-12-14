// @flow

import * as React from 'react';
import './css/text-edit.css';

type TextEditProps = {
  id: string, // Note: this is NOT the HTML id property but rather the database id (or fake database id for TDLIs)
  className?: string,
  placeholder?: string,
  initText?: string,
  handleInput: (id: string, newValue: string, textEditEL: Node) => void,
  handleBlur: (id: string, curValue: string, textEditEl: Node) => void,
};

export default class TextEdit extends React.PureComponent<TextEditProps, {}> {
  el: { current: null | HTMLDivElement };

  constructor(props: TextEditProps) {
    super(props);
    this.el = React.createRef();
  }

  componentDidMount() {
    this.updateInitText();
  }

  componentDidUpdate(prevProps: TextEditProps, prevState: {}, snapshot: any) {
    this.updateInitText();
  }

  updateInitText = () => {
    const { initText } = this.props;
    if (initText && this.el.current) {
      this.el.current.textContent = initText;
    }
  };

  handleInput = (e: SyntheticInputEvent<HTMLDivElement>) => {
    const { id, handleInput } = this.props;
    handleInput(id, e.currentTarget.textContent, e.currentTarget);
  };

  handleBlur = (e: SyntheticFocusEvent<HTMLDivElement>) => {
    const { id, handleBlur } = this.props;
    if (handleBlur) {
      handleBlur(id, e.currentTarget.textContent, e.currentTarget);
    }
  };

  render() {
    const { className, placeholder } = this.props;

    return (
      <div
        ref={this.el}
        className={`text-edit ${className || ''}`}
        placeholder={placeholder || 'Type something...'}
        onInput={this.handleInput}
        onBlur={this.handleBlur}
        contentEditable
      />
    );
  }
}
