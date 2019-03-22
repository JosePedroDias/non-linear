/**************DICES**************/
const dices = document.getElementById('dices');

const rollDie = (sides = 6) => dices.innerHtml = 1 + Math.floor(sides * Math.random());

const rollDices = (diceCounts = 2, sides) => {
  let sum = 0;

  while (diceCounts--) {
    sum += rollDie(sides);
  }

  return dices.innerHtml = sum;
};
/**************DICES**************/

/**************POTIONS**************/
class Potion {
  constructor(name, hero) {
    this.name = name;
    this.hero = hero;
    this.portion = 2;
  }

  hasAttr() {
    return this.portion;
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

function createPotion(name, hero) {
  let Potion;

  switch (name) {
    case 'skill':
      Potion = PotionOfSkill;
      break;
    case 'strength':
      Potion = PotionOfStrength;
      break;
    case 'fortune':
      Potion = PotionOfFortune;
      break;
  }

  return new Potion(name, hero);
}
/**************POTIONS**************/

/**************ATTRIBUTES**************/
class Attribute {
  constructor(name, value, notLimited) {
    this.name = name;
    this.initial = this.value = value;

    if (notLimited) {
      this.initial = Number.MAX_VALUE;
    }
  }

  has() {
    return this.value > 0;
  }

  update(inc, force) {
    this.value += inc;

    if (!force && this.value > this.initial) {
      this.value = this.initial;
    }

    return this;
  }

  restore() {
    this.value = this.initial;

    return this;
  }

  toString() {
    return this.value;
  }
}
/**************ATTRIBUTES**************/

/**************EQUIPMENT**************/
class Equipment {
  constructor({ type, shouldUnequip = true, skill = 0, stamina = 0, luck = 0, bind }) {
    this.type = type;
    this.skill = skill;
    this.stamina = stamina;
    this.luck = luck;
    this.shouldUnequip = shouldUnequip;
    this.bind = bind;
  }

  equip(hero) {
    hero.skill.update(this.skill);
    hero.stamina.update(this.stamina);
    hero.luck.update(this.luck);

    return this;
  }

  unequip(hero) {
    if (!this.shouldUnequip) { return; }

    hero.skill.update(-this.skill);
    hero.stamina.update(-this.stamina);
    hero.luck.update(-this.luck);
  }
}

const equipments = {
  circularIronShield: new Equipment({ type: 'shield' }),
  bronzeHelmet: new Equipment({ type: 'helmet', skill: -1, bind: true }),
  ironHelmet: new Equipment({ type: 'helmet' }),
  gleamingSword: new Equipment({ type: 'weapon', skill: 1, shouldUnequip: false })
}
/**************EQUIPMENT**************/

/**************CREATURE**************/
class Creature {
  constructor({ name, skill, stamina }) {
    this.name = name;
    this.skill = new Attribute('skill', skill);
    this.stamina = new Attribute('stamina', stamina);
  }

  attack() {
    return rollDices() + this.skill;
  }

  hasAttr(name) {
    if (name in this) {
      return this[name].has();
    }

    return false;
  }

  updateAttr(name, value, force) {
    if (name in this) {
      this[name].update(value, force);
    }

    return this;
  }

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
    this.provition = new Attribute('provition', 10);

    this.potion = createPotion(potion, this);

    this.gold = new Attribute('gold', 0, true);

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

  takeItem(name) {
    this.items[name] = true;

    return this;
  }

  haveItem(name) {
    return name in this.items;
  }

  dropItem(name) {
    delete this.items[name];

    return this;  
  }

  takeKey(name) {
    this.keys[name] = true;

    return this;
  }

  haveKeys(name) {
    return name in this.keys;
  }

  eat(modifiers = 0, force) {
    this.provition.update(-1);
    this.stamina.update(4 + modifiers, force);

    return this;
  }

  drinkPotion() {
    this.potion.drink();
  }

  haveEnoughGold(amount) {
    return this.gold >= amount;
  }

  attack(skillModifier = 0) {
    return rollDices() + this.skill + skillModifier;
  }

  testLuck(luckModifier) {
    const wasLucky = rollDices() + luckModifier <= this.luck;

    this.updateAttr('luck', -1);

    return wasLucky;
  }

  toString() {
    return `${super.toString()}\tLUCK ${this.luck}`;
  }
}

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
/**************CREATURE**************/

/**************FIGHT**************/
class Fight {
  constructor({
    hero,
    monsters,
    canEscape = true,
    section,
    beatEmUp,
    modifiers: {
      skill = 0,
      luck = 0
    } = {}
  }) {
    this.hero = hero;
    this.monsters = monsters;
    this.canEscape = canEscape;
    this.section = section;
    this.beatEmUp = beatEmUp;
    this.modifiers = {
      skill: skill + ~~(hero.helmet === equipments.ironHelmet),
      luck
    };
  }

  turn() {
    let label;
    const actions = this.beatEmUp ? this.monsters.map((monster, index) => ({
      label: `Fight ${monster.name}`,
      callback: () => this.attackMob(index)
    })) : [
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

    this.hero.updateAttr('stamina', -damage);

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

    let label = `Hero Strenght\tMonster Strenght (${this.monsters[0].name})
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
  }

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

      if (this.hero.shield === equipments.circularIronShield && rollDie() === 6) {
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
      wounded.updateAttr('stamina', -damage);
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

  attackMob(attackedIndex, index = 0) {
    const actions = [];

    this.heroStrenght = this.hero.attack(this.modifiers.skill);
    this.monsterStrenght = this.monsters[index].attack();

    let label = `Hero Strenght\tMonster Strenght (${this.monsters[index].name})
${this.heroStrenght}\t\t\t\t${this.monsterStrenght}
`;

    if (this.heroStrenght === this.monsterStrenght) {
      label += '\nDraw';
      actions.push({
        label: 'Continue',
        callback: this.monsters.length - 1 === index ? () => this.turn() : () => this.attackMob(attackedIndex, ++index)
      });
    } else if (this.heroStrenght > this.monsterStrenght && attackedIndex !== index) {
      actions.push({
        label: 'Continue',
        callback: this.monsters.length - 1 === index ? () => this.turn() : () => this.attackMob(attackedIndex, ++index)
      });
    } else {
      label += '\nDo you want to Test your Luck?';
      actions.push(
        {
          callback: () => this.damageMob(attackedIndex, index, true),
          label: 'Yes'
        },
        {
          callback: () => this.damageMob(attackedIndex, index),
          label: 'No'
        }
      );
    }

    return { actions, label };
  }

  damageMob(attackedIndex, index, testLuck) {
    let damage = 2;
    let wasLucky;
    let wounded;

    if (testLuck) {
      wasLucky = this.hero.testLuck(this.modifiers.luck);
    }

    const monsterWounded = this.heroStrenght > this.monsterStrenght;

    if (monsterWounded) {
      wounded = this.monsters[index];

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

      if (this.hero.shield === equipments.circularIronShield && rollDie() === 6) {
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
      wounded.updateAttr('stamina', -damage);
    }

    if (wounded.stamina >= 1) {
      return {
        label: `${wounded.name} ${damage > 0 ? `was wounded (${damage}).` : 'parry the blow'}`,
        actions: [
          {
            label: 'Continue',
            callback: this.monsters.length - 1 === index ? () => this.turn() : () => this.attackMob(attackedIndex, ++index)
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

      const [monster] = this.monsters.splice(attackedIndex, 1);

      return {
        label: `You killed ${monster.name}!`,
        actions: [
          {
            label: 'Continue',
            callback: this.monsters.length - 1 === index ? () => this.turn() : () => this.attackMob(attackedIndex, index)
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
/**************FIGHT**************/
