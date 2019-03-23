const fs = require('fs');

const o = JSON.parse(fs.readFileSync('adventure/scenes.json').toString());

function traverse(o, fn) {
  const t = typeof o;
  if (t === 'object') {
    if (o instanceof Array) {
      if (typeof o[0] === 'string') {
        fn(o);
      } else {
        o.forEach((item) => traverse(item, fn));
      }
    } else {
      Object.keys(o).forEach((k) => traverse(o[k], fn));
    }
  }
}

let out = [];
Object.keys(o).forEach((k) => {
  const v = o[k];

  const inter = v.interaction;
  if (inter) {
    const actions = { goTo: [] };
    function fn(arr) {
      const a = arr[0];
      const b = arr.slice(1);
      // console.log(a, b);
      actions[a].push(b);
    }
    traverse(inter, fn);
    const destinations = actions.goTo.map((arr) => arr[0]);
    //console.log('k', k);
    //console.log('actions', actions);
    //console.log('destinations', destinations);

    destinations.forEach((to) => {
      out.push(`  "${k}" -> "${to}"`);
    });

    out.unshift(`  "${k}" [color="blue"]`);
  } else {
    console.log('DEAD END: ' + k);
    out.unshift(`  "${k}" [color="red"]`);
  }
});

out.unshift('  "1" [color="orange"]');
out.unshift('digraph {');
out.push('}');

out = out.join('\n');

fs.writeFileSync('adventure/adventureGenerated.dot', out);
