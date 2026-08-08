#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outputDir = join(process.cwd(), 'src/assets/art/plan-days');
mkdirSync(outputDir, { recursive: true });

const plans = [
  ['peace-7', 7],
  ['gratitude-7', 7],
  ['psalms-30', 30],
  ['gospels-90', 90],
  ['bible-365', 365],
];

const palettes = [
  {
    dawn: ['#E8E1D3', '#91B4C2', '#647C79', '#B8C9B3', '#E3A83B', 'rgba(255,246,218,0.32)'],
    vigil: ['#0E1728', '#29445E', '#111B2D', '#263A49', '#E1A940', 'rgba(116,162,190,0.20)'],
  },
  {
    dawn: ['#F0E2CC', '#AFC6AD', '#71836D', '#CBD6B4', '#D18C4B', 'rgba(255,239,205,0.32)'],
    vigil: ['#121A26', '#304338', '#121D20', '#2A423B', '#D99D54', 'rgba(120,158,138,0.20)'],
  },
  {
    dawn: ['#E9DCE8', '#9EAAC7', '#6C6D8A', '#C4B6CE', '#D59B56', 'rgba(244,228,255,0.30)'],
    vigil: ['#151529', '#34385A', '#17182C', '#34344C', '#D7A14F', 'rgba(137,140,190,0.18)'],
  },
  {
    dawn: ['#E5E4D6', '#83B8B6', '#587D7D', '#B8CBC2', '#E0A83D', 'rgba(235,250,242,0.32)'],
    vigil: ['#0D1922', '#24505A', '#0F2028', '#24434A', '#E1AB44', 'rgba(94,164,171,0.18)'],
  },
  {
    dawn: ['#F1DFC1', '#C2AA78', '#756B4D', '#D0C39B', '#C98C31', 'rgba(255,241,205,0.30)'],
    vigil: ['#18170F', '#4B3B24', '#211F18', '#463A2B', '#D9A441', 'rgba(176,137,72,0.18)'],
  },
  {
    dawn: ['#E2E8ED', '#8EA9C9', '#5A708F', '#B8C7D9', '#D79B47', 'rgba(238,246,255,0.30)'],
    vigil: ['#0F1627', '#273E66', '#111A2E', '#293A55', '#DCA54D', 'rgba(106,137,185,0.18)'],
  },
  {
    dawn: ['#F0DED0', '#C58F76', '#7E5D52', '#D7B7A7', '#D49A42', 'rgba(255,231,214,0.30)'],
    vigil: ['#1A1319', '#57323A', '#241A22', '#4B3038', '#D8A04B', 'rgba(176,105,116,0.18)'],
  },
  {
    dawn: ['#E8E6D8', '#91C8C5', '#5B8588', '#C2D7CA', '#D7A043', 'rgba(239,255,245,0.30)'],
    vigil: ['#0E1821', '#24505A', '#112129', '#28454A', '#DEA64A', 'rgba(95,166,165,0.18)'],
  },
];

function geometry(seed) {
  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  const horizon = 112 + Math.round(next() * 35);
  const focusX = 405 + Math.round(next() * 190);
  const focusY = 35 + Math.round(next() * 65);
  const ridgeA = 8 + Math.round(next() * 32);
  const ridgeB = 10 + Math.round(next() * 28);
  const detail = Array.from({ length: 30 }, () => next());
  return { horizon, focusX, focusY, ridgeA, ridgeB, detail };
}

function addFill(args, color, command) {
  args.push('-fill', color, '-stroke', 'none', '-draw', command);
}

function addStroke(args, color, width, command) {
  args.push('-fill', 'none', '-stroke', color, '-strokewidth', String(width), '-draw', command);
}

function sceneArgs(seed, theme, paletteIndex) {
  const colors = palettes[paletteIndex][theme];
  const [skyTop, skyBottom, land, ridge, accent, mist] = colors;
  const g = geometry(seed);
  const args = ['-size', '640x200', `gradient:${skyTop}-${skyBottom}`];
  const h = g.horizon;

  addFill(
    args,
    ridge,
    `path 'M 0,${h + 8} C 105,${h - g.ridgeA} 205,${h + 20} 320,${h - 4} C 430,${h - g.ridgeB} 535,${h + 16} 640,${h - 10} L 640,200 L 0,200 Z'`,
  );
  addFill(
    args,
    land,
    `path 'M 0,${h + 30} C 135,${h + 5} 245,${h + 32} 360,${h + 15} C 470,${h - 1} 548,${h + 30} 640,${h + 12} L 640,200 L 0,200 Z'`,
  );

  const scene = seed % 12;
  const x = g.focusX;
  const y = g.focusY;
  const d = g.detail;

  if (scene === 0) {
    addFill(args, accent, `circle ${x},${y} ${x + 18},${y}`);
    addStroke(args, mist, 5, `line 360,${h + 4} 640,${h - 7}`);
  } else if (scene === 1) {
    for (let n = 0; n < 5; n += 1) addStroke(args, mist, 2, `line ${340 + n * 12},${h + 12 + n * 9} 640,${h + 8 + n * 9}`);
    addFill(args, accent, `circle ${x},${Math.min(y + 20, h - 10)} ${x + 12},${Math.min(y + 20, h - 10)}`);
  } else if (scene === 2) {
    addFill(args, mist, `polygon 355,${h + 28} ${430 + Math.round(d[0] * 35)},${h - 65} 505,${h + 28}`);
    addFill(args, ridge, `polygon 440,${h + 28} ${520 + Math.round(d[1] * 28)},${h - 82} 625,${h + 28}`);
    addFill(args, accent, `circle ${590},${42 + Math.round(d[2] * 40)} ${600},${42 + Math.round(d[2] * 40)}`);
  } else if (scene === 3) {
    addFill(args, mist, `path 'M 330,${h + 28} C 390,${h - 22} 455,${h + 6} 510,${h + 25} C 555,${h + 40} 600,${h - 8} 640,${h + 8} L 640,200 L 330,200 Z'`);
    addFill(args, accent, `circle ${x},${y} ${x + 13},${y}`);
  } else if (scene === 4) {
    for (let n = 0; n < 11; n += 1) {
      const gx = 360 + Math.round(d[n] * 275);
      const gy = h + 18 + Math.round(d[(n + 8) % d.length] * 35);
      addStroke(args, mist, 2, `line ${gx},${gy + 40} ${gx + Math.round((d[(n + 4) % d.length] - 0.5) * 18)},${gy}`);
    }
    addFill(args, accent, `circle ${x},${y} ${x + 10},${y}`);
  } else if (scene === 5) {
    for (let n = 0; n < 7; n += 1) {
      const tx = 360 + Math.round(d[n] * 270);
      const th = 32 + Math.round(d[n + 7] * 55);
      addFill(args, n % 2 ? ridge : mist, `polygon ${tx - 18},${h + 40} ${tx},${h + 40 - th} ${tx + 18},${h + 40}`);
    }
  } else if (scene === 6) {
    for (let n = 0; n < 5; n += 1) {
      const cx = 365 + Math.round(d[n] * 240);
      const cy = 32 + Math.round(d[n + 5] * 65);
      const rw = 24 + Math.round(d[n + 10] * 42);
      addFill(args, mist, `ellipse ${cx},${cy} ${rw},12 0,360`);
    }
    addFill(args, accent, `circle ${x},${y} ${x + 8},${y}`);
  } else if (scene === 7) {
    for (let n = 0; n < 13; n += 1) {
      const sx = 350 + Math.round(d[n] * 285);
      const sy = 18 + Math.round(d[n + 13] * 92);
      const sr = n % 4 === 0 ? 3 : 1;
      addFill(args, n % 3 === 0 ? accent : mist, `circle ${sx},${sy} ${sx + sr},${sy}`);
    }
  } else if (scene === 8) {
    const archX = 425 + Math.round(d[0] * 105);
    addFill(args, mist, `roundrectangle ${archX},42 ${archX + 112},${h + 44} 54,54`);
    addFill(args, land, `rectangle ${archX + 18},82 ${archX + 94},${h + 44}`);
    addFill(args, accent, `ellipse ${archX + 56},${h + 5} 22,10 0,360`);
  } else if (scene === 9) {
    const endX = 440 + Math.round(d[0] * 120);
    addFill(args, mist, `polygon 355,200 600,200 ${endX + 22},${h + 1} ${endX},${h - 5}`);
    addFill(args, accent, `circle ${x},${y} ${x + 9},${y}`);
  } else if (scene === 10) {
    addFill(args, mist, `polygon ${x - 36},18 ${x + 34},18 ${x + 100},${h + 50} ${x + 15},${h + 50}`);
    for (let n = 0; n < 9; n += 1) {
      const rx = 350 + Math.round(d[n] * 280);
      const ry = 35 + Math.round(d[n + 9] * 80);
      addStroke(args, ridge, 2, `line ${rx},${ry} ${rx - 8},${ry + 22}`);
    }
  } else {
    for (let n = 0; n < 6; n += 1) {
      const sx = 410 + Math.round(d[n] * 180);
      const sy = h + 34 - n * 10 - Math.round(d[n + 6] * 12);
      const rw = 16 + Math.round(d[n + 12] * 20);
      addFill(args, n === 5 ? accent : mist, `ellipse ${sx},${sy} ${rw},7 0,360`);
    }
  }

  args.push('-blur', '0x0.28', '-strip', '-quality', '82');
  return args;
}

let planOffset = 0;
for (const [planId, count] of plans) {
  for (let day = 1; day <= count; day += 1) {
    const seed = 811 + planOffset * 1009 + day * 97;
    const paletteIndex = (planOffset * 3 + day * 5 + Math.floor(day / 7)) % palettes.length;
    for (const theme of ['dawn', 'vigil']) {
      const filename = `${planId}-${String(day).padStart(3, '0')}-${theme}.webp`;
      execFileSync('convert', [...sceneArgs(seed, theme, paletteIndex), join(outputDir, filename)], { stdio: 'ignore' });
    }
  }
  planOffset += 1;
}

console.log('Generated 998 distinct plan-day artworks (499 Dawn + 499 Vigil).');
