function fetchAdventure() {
  return fetch('adventure/narrative.json').then((resp) => resp.json());
}

fetchAdventure().then((adv) => {
  function testLuck(luckyTo, unluckyTo) {
    const to = Math.random() < 0.5 ? luckyTo : unluckyTo;
    doStep(to);
  }

  function doStep(name) {
    const section = adv[name];
    if (!section) {
      return window.alert('SECTION NOT FOUND: ' + name);
    }

    location.hash = name;

    text.innerHTML = section.text;
    const hasImage = !!section.image;
    caption.innerHTML = section.caption || '';
    image.src = 'adventure/' + section.image || '';
    image.style.display = hasImage ? '' : 'none';
    caption.style.display = hasImage ? '' : 'none';

    interactions.innerHTML = '';
    if (section.interaction) {
      const inter = section.interaction;
      if (inter.kind === 'gotos') {
        inter.options.forEach((opt) => {
          const el = document.createElement('button');
          el.appendChild(document.createTextNode(opt.label));
          el.onclick = function() {
            doStep(opt.to);
          };
          interactions.appendChild(el);
        });
      } else if (inter.kind === 'luck') {
        const el = document.createElement('button');
        el.appendChild(document.createTextNode('test luck'));
        el.onclick = function() {
          testLuck.apply(null, inter.options);
        };
        interactions.appendChild(el);
      } else {
        window.alert('interaction kind ' + inter.kind + ' unsupported');
      }
    }
  }

  window.doStep = doStep;

  function onHash() {
    const hash = (location.hash && location.hash.substring(1)) || '0';
    doStep(hash);
  }
  document.addEventListener('hashchange', onHash);
  onHash();
});
