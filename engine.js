function load() {
  fetch('adventure/narrative.json5')
    .then((resp) => resp.text())
    .then((txt) => {
      console.log(txt);
      const o = JSON5.parse(txt);
      console.log(o);
    });
}

load();
