const dices = document.getElementById('dices');

const rollDie = (sides = 6) => dices.innerHtml = 1 + Math.floor(sides * Math.random());

const rollDices = (diceCounts = 2, sides) => {
  let sum = 0;

  while (diceCounts--) {
    sum += rollDie(sides);
  }

  return dices.innerHtml = sum;
};

function createCharacter(name) {
  const skill = rollDie() + 6;
  const stamina = rollDices() + 12;
  const luck = rollDie() + 6;

  const potion = window.prompt('Which potion do you like to have (skill, strength, fortune)', 'strength')

  return new Character({
    name,
    skill,
    stamina,
    potion,
    luck
  });
};

function createPotion(name, hero) {
  let potion;

  switch (name) {
    case 'skill':
      potion = PotionOfSkill;
      break;
    case 'strength':
      potion = PotionOfStrength;
      break;
    case 'fortune':
      potion = PotionOfFortune;
      break;
  }

  return new potion(name, hero);
}

class Attribute {
  constructor(name, value) {
    this.name = name;
    this.initial = this.value = value;
  }

  toString() {
    return this.value;
  }

  restore() {
    this.value = this.initial;

    return this;
  }

  update(inc, force) {
    this.value += inc;

    if (!force && this.value > this.initial) {
      this.value = this.initial;
    }

    return this;
  }
}

class Potion {
  constructor(name, hero) {
    this.name = name;
    this.hero = hero;
    this.portion = 2;
  }

  toString() {
    return `${this.name}: ${this.portion}`;
  }

  drink() {
    this.portion--;
  }
}

class PotionOfSkill extends Potion {
  drink() {
    super.drink();

    this.hero.skill.restore();
  }
}

class PotionOfStrength extends Potion {
  drink() {
    super.drink();

    this.hero.stamina.restore();
  }
}

class PotionOfFortune extends Potion {
  drink() {
    super.drink();

    this.hero.luck.restore();
    this.hero.luck.update(1, true);
  }
}

class Equipment {
  constructor({ type, skill = 0, stamina = 0, luck = 0, bind }) {
    this.type = type;
    this.skill = skill;
    this.stamina = stamina;
    this.luck = luck;
    this.bind = bind;
  }

  equip(hero) {
    hero.skill.update(this.skill);
    hero.stamina.update(this.stamina);
    hero.luck.update(this.luck);

    return this;
  }

  unequip(hero) {
    hero.skill.update(-this.skill);
    hero.stamina.update(-this.stamina);
    hero.luck.update(-this.luck);
  }
}

const equipments = {
  circularIronShield: new Equipment({ type: 'shield' }),
  bronzeHelmet: new Equipment({ type: 'helmet', skill: -1, bind: true }),
  ironHelmet: new Equipment({ type: 'helmet' }),
  gleamingSword: new Equipment({ type: 'weapon', skill: 1 })
}

class Creature {
  constructor({ name, skill, stamina }) {
    this.name = name;
    this.skill = new Attribute('skill', skill);
    this.stamina = new Attribute('stamina', stamina);
  }

  attack() {
    return rollDices() + this.skill;
  }

  updateSkill(value, force) {
    this.skill.update(value, force);

    return this;
  };

  updateStamina(value, force) {
    this.stamina.update(value, force);

    return this;
  };

  toString() {
    const { name, skill, stamina } = this;

    return `${name}\tSKILL ${skill}\tSTAMINA ${stamina}`;
  }

  toSimpleString() {
    const { name, skill, stamina } = this;

    return `${name}\t${skill}\t\t\t${stamina}`;
  }
}

class Character extends Creature {
  constructor({ luck, potion, ...rest }) {
    super(rest);

    this.luck = new Attribute('luck', luck);
    this.meal = new Attribute('meal', 10);

    this.potion = createPotion(potion, this);

    this.gold = new Attribute('gold', 0);

    this.items = {};
    this.keys = {};
  }

  equipItem(equipment) {
    const { type } = equipment;

    if (this[type]) {
      if (this[type].bind) { return; }

      this[type].unequip(this);
    }

    this[type] = equipment.equip(this);
  }

  haveItem(name) {
    return name in this.items;
  }

  useItem(name) {
    delete this.items[name];

    return this;  
  }

  takeItem(name) {
    this.items[name] = true;

    return this;
  }

  haveKeys(name) {
    return name in this.keys;
  }

  takeKey(name) {
    this.keys[name] = true;

    return this;
  }

  haveMeals() {
    return this.meal >= 1;
  }

  eat(force) {
    this.meal.update(-1);
    this.stamina.update(4, force);

    return this;
  }

  updateMeal(value, force) {
    this.meal.update(value, force);

    return this;
  };

  havePotion() {
    return this.potion.portion > 0;
  }

  drinkPotion() {
    this.potion.drink();
  }

  haveEnoughGold(amount) {
    return this.gold >= amount;
  }

  updateGold(value) {
    this.gold.update(value, true);

    return this;
  };

  attack(skillModifier = 0) {
    return rollDices() + this.skill + skillModifier;
  }

  updateLuck(value, force) {
    this.luck.update(value, force);

    return this;
  };

  testLuck(luckModifier) {
    const wasLucky = rollDices() + luckModifier <= this.luck;

    this.updateLuck(-1);

    return wasLucky;
  }

  toString() {
    return `${super.toString()}\tLUCK ${this.luck}`;
  }
}

class Fight {
  constructor({
    hero,
    monsters,
    canEscape = true,
    section,
    modifiers: {
      skill = 0,
      luck = 0
    } = {}
  }) {
    this.hero = hero;
    this.monsters = monsters;
    this.canEscape = canEscape;
    this.section = section;
    this.modifiers = {
      skill: skill + ~~(hero.helmet === equipments.ironHelmet),
      luck
    };
  }

  turn() {
    let label;
    const actions = [
      {
        label: 'Fight',
        callback: () => this.attack()
      }
    ];

    if (this.monsters.length === 1) {
      label = this.monsters[0].toString();
    } else {
      label = `\t\tSKILL\t\tSTAMINA\n${this.monsters
        .map((monster) => monster.toSimpleString())
        .join('\n')}`;
    }

    if (this.canEscape) {
      actions.push({
        label: 'Escape',
        callback: () => this.escape()
      }, {
        label: 'Escape (with Lucky)',
        callback: () => this.escape(true)
      });
    }

    return { actions, label };
  };

  escape(testLuck) {
    let damage = 2;

    if (testLuck) {
      damage += this.hero.testLuck(this.modifiers.luck) ? -1 : 1;
    }

    this.hero.updateStamina(-damage);

    if (this.hero.stamina >= 1) {
      return {
        label: `You escape but took ${damage} damage.`,
        escape: true
      };
    }

    return {
      label: 'GAME OVER!',
      alive: false
    };
  }

  attack() {
    const actions = [];

    this.heroStrenght = this.hero.attack(this.modifiers.skill);
    this.monsterStrenght = this.monsters[0].attack();

    let label = `Hero Strenght\tMonster Strenght
${this.heroStrenght}\t\t\t\t${this.monsterStrenght}
`;

    if (this.heroStrenght === this.monsterStrenght) {
      label += '\nDraw';
      actions.push({
        label: 'Continue',
        callback: () => this.turn()
      });
    } else {
      label += '\nDo you want to Test your Luck?';
      actions.push(
        {
          callback: () => this.damage(true),
          label: 'Yes'
        },
        {
          callback: () => this.damage(),
          label: 'No'
        }
      );
    }

    return { actions, label };
  };

  damage(testLuck) {
    let damage = 2;
    let wasLucky;
    let wounded;

    if (testLuck) {
      wasLucky = this.hero.testLuck(this.modifiers.luck);
    }

    const monsterWounded = this.heroStrenght > this.monsterStrenght;

    if (monsterWounded) {
      wounded = this.monsters[0];

      if (this.section === 39) {
        damage += 1;
      }

      if (wasLucky !== undefined) {
        damage += wasLucky ? 2 : -1;
      }
    } else {
      wounded = this.hero;

      if (wasLucky !== undefined) {
        damage += wasLucky ? -1 : 1;
      }

      if (hero.shield === equipments.circularIronShield && rollDie() === 6) {
        damage -= 1;
      }

      if (this.section === 39) {
        const die = rollDie();

        if (die === 6) {
          damage = 0;
        } else if (die === 2 || die === 4) {
          damage -= 1;
        }
      }
    }

    if (damage > 0) {
      wounded.updateStamina(-damage);
    }

    if (wounded.stamina >= 1) {
      return {
        label: `${wounded.name} ${damage > 0 ? `was wounded (${damage}).` : 'parry the blow'}`,
        actions: [
          {
            label: 'Continue',
            callback: () => this.turn()
          }
        ]
      };
    }

    if (monsterWounded) {
      if (this.monsters.length === 1) {
        return {
          label: 'You WIN!',
          alive: true
        };
      }

      const monster = this.monsters.shift();

      return {
        label: `You killed ${monster.name}!`,
        actions: [
          {
            label: 'Continue',
            callback: () => this.turn()
          }
        ]
      };
    }

    return {
      label: 'GAME OVER!',
      alive: false
    };
  }
}
