export function getColorCode() {
  // const color = ((Math.random() * 0xffffff) | 0).toString(16);
  // return `#${('000000' + color).slice(-6)}`;
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return [`rgba(${r},${g},${b},1)`, `rgba(${r},${g},${b},0.4)`];
}
