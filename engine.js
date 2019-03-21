function fetchAdventure() {
  return fetch('adventure/narrative.json5')
    .then((resp) => resp.text())
    .then((txt) => {
      return JSON5.parse(txt);
    });
}

fetchAdventure().then((adv) => {
  const section = adv['0'];
  text.innerHTML = section.text;
});
