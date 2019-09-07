export function getColorCode() {
  // const color = ((Math.random() * 0xffffff) | 0).toString(16);
  // return `#${('000000' + color).slice(-6)}`;
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return [`rgba(${r},${g},${b},1)`, `rgba(${r},${g},${b},0.4)`];
}

export function getPath() {
  return (
    window.location.pathname.split('/')[1] || process.env.REACT_APP_CHANNEL
  );
}

export function getParam(param: string) {
  const query = window.location.search;
  const regexp = new RegExp('[\\?&]' + param + '=([^&#]*)', 'i');
  const val = query.match(regexp);
  return val ? val[1] : 1;
}
