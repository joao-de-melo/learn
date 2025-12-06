import React from 'react';

const ICON_MAP = {
  star: '\u2B50',
  bear: '\uD83D\uDC3B',
  robot: '\uD83E\uDD16',
  heart: '\u2764\uFE0F',
  flower: '\uD83C\uDF38',
  car: '\uD83D\uDE97',
  apple: '\uD83C\uDF4E',
  fish: '\uD83D\uDC1F',
  bird: '\uD83D\uDC26',
  ball: '\u26BD',
  book: '\uD83D\uDCD6',
  puzzle: '\uD83E\uDDE9',
  calculator: '\uD83E\uDDEE',
  circle: '\u2B55',
  square: '\uD83D\uDFE6',
  triangle: '\uD83D\uDD3A',
  red: '\uD83D\uDD34',
  blue: '\uD83D\uDD35',
  green: '\uD83D\uDFE2',
  yellow: '\uD83D\uDFE1',
  cat: '\uD83D\uDC31',
  dog: '\uD83D\uDC36',
  banana: '\uD83C\uDF4C',
};

// Icons suitable for counting exercises
const COUNTING_ICONS = ['star', 'bear', 'robot', 'heart', 'flower', 'apple', 'ball', 'car', 'fish', 'bird'];

export function getRandomIcon() {
  return COUNTING_ICONS[Math.floor(Math.random() * COUNTING_ICONS.length)];
}

export function getIcon(name) {
  return ICON_MAP[name] || name;
}

export function IconDisplay({ icons, size = 'normal', crossedOut = 0 }) {
  return (
    <span className={`icon-display icon-display-${size}`}>
      {icons.map((icon, i) => (
        <span key={i} className={i < crossedOut ? 'crossed-out' : ''}>
          {getIcon(icon)}
        </span>
      ))}
    </span>
  );
}

export function VisualAddition({ left, right, size = 'large' }) {
  return (
    <div className="visual-display">
      <div className="visual-group">
        <IconDisplay icons={left} size={size} />
      </div>
      <span className="operator">+</span>
      <div className="visual-group">
        <IconDisplay icons={right} size={size} />
      </div>
      <span className="operator">=</span>
      <span className="operator">?</span>
    </div>
  );
}

export function VisualCount({ icons, size = 'large' }) {
  return (
    <div className="visual-display">
      <IconDisplay icons={icons} size={size} />
    </div>
  );
}

export default IconDisplay;
