/**************DICES**************/
const dices = document.getElementsByClassName('die');
const cubes = document.getElementsByClassName('cube');

const rollDie = (color = 'white', die = dices[0], cube = cubes[0], sides = 6) =>
  new Promise((resolve) => {
    cube.classList.add(color);
    cube.classList.add('animation-2');
    die.classList.remove('hide');

    setTimeout(() => {
      cube.classList.remove('animation-2');

      const value = 1 + Math.floor(sides * Math.random());

      cube.classList.add(`show-${value}`);

      setTimeout(() => {
        cube.classList.remove(`show-${value}`);
        cube.classList.remove(color);
        die.classList.add('hide');

        resolve(value);
      }, 400);
    }, 600);
  });

const sum = (a, b) => a + b;
const rollDices = async (color, diceCounts = 2, sides) =>
  Promise.all(new Array(diceCounts).fill(0).map((_, index) =>
    rollDie(color, dices[index], cubes[index], sides)
  )).then((rolls) => rolls.reduce(sum));
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
  constructor({
    type,
    shouldUnequip = true,
    skill = 0,
    stamina = 0,
    luck = 0,
    bind
  }) {
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
    if (!this.shouldUnequip) {
      return;
    }

    hero.skill.update(-this.skill);
    hero.stamina.update(-this.stamina);
    hero.luck.update(-this.luck);
  }
}

const equipments = {
  circularIronShield: new Equipment({ type: 'shield' }),
  bronzeHelmet: new Equipment({ type: 'helmet', skill: -1, bind: true }),
  ironHelmet: new Equipment({ type: 'helmet' }),
  gleamingSword: new Equipment({
    type: 'weapon',
    skill: 1,
    shouldUnequip: false
  })
};
/**************EQUIPMENT**************/

/**************CREATURE**************/
class Creature {
  constructor({ name, skill, stamina }) {
    this.name = name;
    this.skill = new Attribute('skill', skill);
    this.stamina = new Attribute('stamina', stamina);
  }

  async attack() {
    return (await rollDices('green')) + this.skill;
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
    this.provision = new Attribute('provision', 10);

    this.potion = createPotion(potion, this);

    this.gold = new Attribute('gold', 0, true);

    this.items = {};
    this.keys = {};
  }

  equipItem(equipment) {
    const { type } = equipment;

    if (this[type]) {
      if (this[type].bind) {
        return;
      }

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
    this.provision.update(-1);
    this.stamina.update(4 + modifiers, force);

    return this;
  }

  drinkPotion() {
    this.potion.drink();
  }

  haveEnoughGold(amount) {
    return this.gold >= amount;
  }

  async attack(skillModifier = 0) {
    return (await rollDices('yellow')) + this.skill + skillModifier;
  }

  async testLuck(luckModifier) {
    const wasLucky = (await rollDices()) <= this.luck + luckModifier;

    this.updateAttr('luck', -1);

    return wasLucky;
  }

  toString() {
    return `${super.toString()}\tLUCK ${this.luck}`;
  }
}

async function createCharacter(name, potion = 'strength') {
  const skill = (await rollDie('blue')) + 6;
  const stamina = (await rollDices('red')) + 12;
  const luck = (await rollDie()) + 6;

  return new Character({
    name,
    skill,
    stamina,
    potion,
    luck
  });
}
/**************CREATURE**************/

/**************FIGHT**************/
class Fight {
  constructor({
    hero,
    monsters,
    canEscape,
    section,
    beatEmUp,
    modifiers: { skill = 0, luck = 0 } = {}
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
    const actions = this.beatEmUp
      ? this.monsters.map((monster, index) => ({
          label: `Fight ${monster.name}`,
          callback: async () => await this.attackMob(index)
        }))
      : [
          {
            label: 'Fight',
            callback: async () => await this.attack()
          }
        ];

    if (this.canEscape) {
      actions.push(
        {
          label: 'Escape',
          callback: async () => await this.escape()
        },
        {
          label: 'Escape (with Lucky)',
          callback: async () => await this.escape(true)
        }
      );
    }

    return { actions, label: '' };
  }

  async escape(testLuck) {
    let damage = 2;

    if (testLuck) {
      damage += (await this.hero.testLuck(this.modifiers.luck)) ? -1 : 1;
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

  async attack() {
    const actions = [];

    this.heroStrength = await this.hero.attack(this.modifiers.skill);
    this.monsterStrength = await this.monsters[0].attack();

    let label = `<div class="fight">
  <div class="hero">
    <span class="fight__name">Hero Strength</span>
    <span class="fight__strength${this.heroStrength > this.monsterStrength ? ' fight__strength--victor' : ''}">${this.heroStrength}</span>
  </div>
  <div class="enemy">
    <span class="fight__name">Monster Strength (${this.monsters[0].name})</span>
    <span class="fight__strength${this.monsterStrength > this.heroStrength ? ' fight__strength--victor' : ''}">${this.monsterStrength}</span>
  </div>
</div>`;

    if (this.heroStrength === this.monsterStrength) {
      label += '<div class="fight__result">Draw</div>';
      actions.push({
        label: 'Continue',
        callback: () => this.turn()
      });
    } else {
      label += '<div class="fight__result">Do you want to Test your Luck?</div>';
      actions.push(
        {
          callback: async () => await this.damage(true),
          label: 'Yes'
        },
        {
          callback: async () => await this.damage(),
          label: 'No'
        }
      );
    }

    return { actions, label };
  }

  async damage(testLuck) {
    let damage = 2;
    let wasLucky;
    let wounded;

    if (testLuck) {
      wasLucky = await this.hero.testLuck(this.modifiers.luck);
    }

    const monsterWounded = this.heroStrength > this.monsterStrength;

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

      if (
        this.hero.shield === equipments.circularIronShield &&
        (await rollDie()) === 6
      ) {
        damage -= 1;
      }

      if (this.section === 39) {
        const die = await rollDie();

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
        label: `<div>${wounded.name} ${
          damage > 0 ? `was wounded (${damage}).` : 'parry the blow'
        }</div>`,
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
          label: '<div>You WIN!</div>',
          alive: true
        };
      }

      const monster = this.monsters.shift();

      return {
        label: `<div>You killed ${monster.name}!</div>`,
        actions: [
          {
            label: 'Continue',
            callback: () => this.turn()
          }
        ]
      };
    }

    return {
      label: '<div class="GAME_OVER">GAME OVER!</div>',
      alive: false
    };
  }

  async attackMob(attackedIndex, index = 0, skipWoundMonster) {
    const actions = [];

    this.heroStrength = await this.hero.attack(this.modifiers.skill);
    this.monsterStrength = await this.monsters[index].attack();

    let label = `<div class="fight">
  <div class="hero">
    <span class="fight__name">Hero Strength</span>
    <span class="fight__strength${this.heroStrength > this.monsterStrength ? ' fight__strength--victor' : ''}">${this.heroStrength}</span>
  </div>
  <div class="enemy">
    <span class="fight__name">Monster Strength (${this.monsters[index].name})</span>
    <span class="fight__strength${this.monsterStrength > this.heroStrength ? ' fight__strength--victor' : ''}">${this.monsterStrength}</span>
  </div>
</div>`;

    if (this.heroStrength === this.monsterStrength) {
      label += '<div class="fight__result">Draw</div>';
      actions.push({
        label: 'Continue',
        callback:
          this.monsters.length - 1 === index
            ? () => this.turn()
            : async () => await this.attackMob(attackedIndex, ++index)
      });
    } else if (
      this.heroStrength > this.monsterStrength &&
      (attackedIndex !== index || skipWoundMonster)
    ) {
      actions.push({
        label: 'Continue',
        callback:
          this.monsters.length - 1 === index
            ? () => this.turn()
            : async () => await this.attackMob(attackedIndex, ++index)
      });
    } else {
      label += '<div class="fight__result">Do you want to Test your Luck?</div>';
      actions.push(
        {
          callback: async () =>
            await this.damageMob(attackedIndex, index, true),
          label: 'Yes'
        },
        {
          callback: async () => await this.damageMob(attackedIndex, index),
          label: 'No'
        }
      );
    }

    return { actions, label };
  }

  async damageMob(attackedIndex, index, testLuck) {
    let damage = 2;
    let wasLucky;
    let wounded;

    if (testLuck) {
      wasLucky = await this.hero.testLuck(this.modifiers.luck);
    }

    const monsterWounded = this.heroStrength > this.monsterStrength;

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

      if (
        this.hero.shield === equipments.circularIronShield &&
        (await rollDie()) === 6
      ) {
        damage -= 1;
      }

      if (this.section === 39) {
        const die = await rollDie();

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
        label: `<div>${wounded.name} ${
          damage > 0 ? `was wounded (${damage}).` : 'parry the blow'
        }</div>`,
        actions: [
          {
            label: 'Continue',
            callback:
              this.monsters.length - 1 === index
                ? () => this.turn()
                : () => this.attackMob(attackedIndex, ++index)
          }
        ]
      };
    }

    if (monsterWounded) {
      if (this.monsters.length === 1) {
        return {
          label: '<div>You WIN!</div>',
          alive: true
        };
      }

      const [monster] = this.monsters.splice(attackedIndex, 1);

      return {
        label: `<div>You killed ${monster.name}!</div>`,
        actions: [
          {
            label: 'Continue',
            callback:
              this.monsters.length === index
                ? () => this.turn()
                : () => this.attackMob(attackedIndex, index, true)
          }
        ]
      };
    }

    return {
      label: '<div class="GAME_OVER">GAME OVER!</div>',
      alive: false
    };
  }
}
/**************FIGHT**************/
