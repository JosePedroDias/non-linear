function fetchAdventure() {
  return fetch('adventure/scenes.json').then((resp) => resp.json());
}

function htmlify(txt) {
  return txt.replace(/\n/gm, '<br />').replace(/\t/g, '    ');
}

fetchAdventure().then((adv) => {
  const hero = createCharacter(
    window.prompt("What is your character's name?", 'hero')
  );

  function updateHero() {
    heroStats.innerHTML = '' + hero;
  }

  updateHero();

  function doFight(inter) {
    const monsters = inter.enemies.map((en) => new Creature(en));
    const fight = new Fight(hero, monsters);
    let outcome;

    outcome = fight.turn(); // text:string, actions:[Obj], escape:bool, alive:bool

    function doSubStep() {
      updateHero();

      details.innerHTML = htmlify(outcome.label);
      console.log(outcome);

      interactions.innerHTML = '';
      if (outcome.actions) {
        outcome.actions.forEach((act) => {
          const el = document.createElement('button');
          el.appendChild(document.createTextNode(act.label));
          el.onclick = function() {
            outcome = act.callback();
            doSubStep();
          };
          interactions.appendChild(el);
        });
      } else if (outcome.alive) {
        const el = document.createElement('button');
        el.appendChild(document.createTextNode('turn page'));
        el.onclick = function() {
          doStep(inter.to);
        };
        interactions.appendChild(el);
      }
    }

    doSubStep();
  }

  function doStep(name) {
    const section = adv[name];
    if (!section) {
      return window.alert('SECTION NOT FOUND: ' + name);
    }

    location.hash = name;

    text.innerHTML = section.text.replace(/\n/g, '<br/>');
    const hasImage = !!section.image;
    caption.innerHTML = section.caption || '';
    if (hasImage) {
      image.src = 'adventure/images/' + section.image || '';
    }
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
          const wasLucky = hero.testLuck();
          const [luckyTo, unLuckyTo] = inter.options;
          updateHero();
          doStep(wasLucky ? luckyTo : unluckyTo);
        };
        interactions.appendChild(el);
      } else if (inter.kind === 'fight') {
        doFight(inter);
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
