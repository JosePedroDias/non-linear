function fetchAdventure() {
  return fetch('adventure/narrative.json5')
    .then((resp) => resp.text())
    .then((txt) => {
      return JSON5.parse(txt);
    });
}

fetchAdventure().then((adv) => {
  function doStep(name) {
    const section = adv[name];
    text.innerHTML = section.text;
    const hasImage = !!section.image;
    caption.innerHTML = section.caption || '';
    image.src = 'adventure/' + section.image || '';
    image.style.display = hasImage ? '' : 'none';
    caption.style.display = hasImage ? '' : 'none';

    if (section.interaction) {
      const inter = section.interaction;
      if (inter.kind === 'gotos') {
        interactions.innerHTML = '';
        inter.options.forEach((opt) => {
          const el = document.createElement('button');
          el.appendChild(document.createTextNode(opt.label));
          el.onclick = function() {
            doStep(opt.to);
          };
          interactions.appendChild(el);
        });
      }
    }
  }

  window.doStep = doStep;

  doStep('0');
});
