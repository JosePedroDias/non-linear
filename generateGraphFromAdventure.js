// based on https://dagrejs.github.io/project/dagre-d3/latest/demo/interactive-demo.html

function traverse(o, fnSArr, fnO) {
  const t = typeof o;
  if (t === 'object') {
    if (o instanceof Array) {
      if (typeof o[0] === 'string') {
        fnSArr(o);
      } else {
        o.forEach((item) => traverse(item, fnSArr, fnO));
      }
    } else {
      if (o.fight) {
        fnO(o, 'fight');
      }
      if (o.lucky) {
        fnO(o, 'luck');
      }
      Object.keys(o).forEach((k) => traverse(o[k], fnSArr, fnO));
    }
  }
}

function generateDotFromAdventure(o) {
  let out = [];

  Object.keys(o).forEach((k) => {
    const v = o[k];

    const inter = v.interaction;
    if (inter) {
      const actions = { goTo: [] };
      function fnA(arr) {
        const a = arr[0];
        const b = arr.slice(1);
        // console.log(a, b);
        actions[a].push(b);
      }
      function fnO(o, event) {
        actions[event] = true;
      }
      traverse(inter, fnA, fnO);
      const destinations = actions.goTo.map((arr) => arr[0]);
      // console.log('k', k);
      //console.log('actions', actions);
      //console.log('destinations', destinations);
      // if (actions.fight) {
      //   console.log(k + ' fight');
      // }
      // if (actions.luck) {
      //   console.log(k + ' luck');
      // }

      destinations.forEach((to) => {
        out.push(`  "${k}" -> "${to}"`);
      });

      const color =
        k === '0'
          ? 'yellow'
          : k === '400'
          ? 'green'
          : destinations.length === 0
          ? 'orange'
          : '#DDD';
      const color2 = actions.fight ? 'red' : actions.luck ? 'purple' : 'black';
      const sw = actions.fight || actions.luck ? 3 : 1;
      out.unshift(
        `  "${k}" [style="fill:${color}; stroke:${color2}; stroke-width:${sw}"]`
      );
    } else {
      console.log('DEAD END: ' + k);
      out.unshift(`  "${k}" [style="fill:red"]`);
    }
  });

  out.unshift('  "1" [style="fill:yellow"]');
  //out.unshift('  edge [style="stroke:brown"]');
  out.unshift('  node [shape="circle"]');

  out.unshift('digraph {');
  out.push('}');

  return out.join('\n');
}

// node part
if (typeof window === undefined) {
  const fs = require('fs');
  const o = JSON.parse(fs.readFileSync('adventure/scenes.json').toString());
  const dot = generateDotFromAdventure(o);
  fs.writeFileSync('adventure/adventureGenerated.dot', dot);
}
