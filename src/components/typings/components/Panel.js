// @flow

import React from 'react';
import './panel.css';

type PanelProps = {
  score: number,
  fps: number,
  wpm: number,
};

export default function Panel(props: PanelProps) {
  const { score, fps, wpm } = props;

  return (
    <div className="panel">
      <div className="score">Score: {score}</div>
      <div className="fps">FPS: {fps}</div>
      <div className="wpm">WPM: {wpm}</div>
    </div>
  );
}
