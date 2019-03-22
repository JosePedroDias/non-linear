const fs = require('fs');

const o = JSON.parse(fs.readFileSync('adventure/scenes.json').toString());

let out = [];
Object.keys(o).forEach((k) => {
  const v = o[k];

  const inter = v.interaction;
  if (inter) {
    const kind = inter.kind;
    if (kind === 'gotos') {
      inter.options.forEach((opt) => {
        out.push(`  "${k}" -> "${opt.to}" [label="${opt.label}"]`);
      });
    } else if (kind === 'fight') {
      out.push(`  "${k}" -> "${inter.to}" [label="after fight"]`);
    } else if (kind === 'luck') {
      if (inter.options.length !== 2) {
        console.log('PROBLEMATIC_LUCKY: ' + k);
        out.push(`  PROBLEMATIC_LUCKY -> ${k}`);
      } else {
        out.push(`  "${k}" -> "${inter.options[0]}" [label="lucky"]`);
        out.push(`  "${k}" -> "${inter.options[1]}" [label="unlucky"]`);
      }
    } else {
      console.log('UNSUPPORTED_KIND: ' + k);
      out.push(`  UNSUPPORTED_KIND -> ${k}`);
    }
  } else {
    console.log('NO_INTER: ' + k);
    out.push(`  NO_INTER -> ${k}`);
  }
});

out.unshift('digraph {');
out.push('}');

out = out.join('\n');

fs.writeFileSync('adventure/adventureGenerated.dot', out);
