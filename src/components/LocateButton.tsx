import React from 'react';

import * as style from '../core/style';

type Props = {
  isDisabled: boolean;
  isSharing: boolean;
  controlLocate: () => void;
};

function LocateButton(props: Props) {
  const { isDisabled, isSharing, controlLocate } = props;

  function handleClick() {
    controlLocate();
  }
  const button = isSharing ? (
    <button onClick={handleClick} style={style.button} disabled={isDisabled}>
      現在地の共有を停止する
    </button>
  ) : (
    <button onClick={handleClick} style={style.button} disabled={isDisabled}>
      現在地の共有を開始する
    </button>
  );

  return button;
}

export default LocateButton;
