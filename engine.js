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
  }

  doStep('0');
});
