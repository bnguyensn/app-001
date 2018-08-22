import * as React from 'react';
import './css/material-icon.css';

export default function MaterialIcon(props) {
    const {icon, className, ...rest} = props;

    return (
        <div className={`material-icons-container ${className}`} {...rest}>
            <i className="material-icons">{icon}</i>
        </div>
    )
}
