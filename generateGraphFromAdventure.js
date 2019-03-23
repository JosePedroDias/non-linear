const fs = require('fs');

const o = JSON.parse(fs.readFileSync('adventure/scenes.json').toString());

function traverse(o, fn) {
  const t = typeof t;
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
    const tra = traverse(inter);
    console.log('k', k);
    console.log('tra', tra);

    out.unshift(`"${k}" [color="blue"]`);
  } else {
    console.log('DEAD END: ' + k);
    out.unshift(`"${k}" [color="red"]`);
  }
});

out.unshift('"1" [color="orange"]');
out.unshift('digraph {');
out.push('}');

out = out.join('\n');

fs.writeFileSync('adventure/adventureGenerated.dot', out);
