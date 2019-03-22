const rollDie = (sides = 6) => 1 + Math.floor(sides * Math.random());

const rollDices = (diceCounts = 2, sides) => {
  let sum = 0;

  while (diceCounts--) {
    sum += rollDie(sides);
  }

  return sum;
};

const createCharacter = (name) => {
  const skill = rollDie() + 6;
  const stamina = rollDices() + 12;
  const luck = rollDie() + 6;

  return new Character({
    name,
    skill,
    stamina,
    luck
  });
};

class Attribute {
  constructor(name, value) {
    this.name = name;
    this.initial = this.value = value;
  }

  toString() {
    return this.value;
  }

  update(inc, force) {
    if (force || this.value + inc <= this.initial) {
      this.value += inc;
    }

    return this;
  }
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
  constructor({ luck, ...rest }) {
    super(rest);

    this.luck = new Attribute('luck', luck);
  }
  
  updateLuck(value, force) {
    this.luck.update(value, force);

    return this;
  };

  testLuck() {
    const wasLucky = rollDices() <= this.luck;

    this.updateLuck(-1);

    return wasLucky;
  }

  toString() {
    return `${super.toString()}\tLUCK ${this.luck}`;
  }
}

class Fight {
  constructor(hero, monsters, canEscape = true) {
    this.hero = hero;
    this.monsters = monsters;
    this.canEscape = canEscape;
  }

  turn() {
    let label = `${this.hero}\n\n`;
    const actions = [
      {
        label: 'Fight',
        callback: () => this.attack()
      }
    ];

    if (this.monsters.length === 1) {
      label += this.monsters[0].toString();
    } else {
      label += `\t\tSKILL\t\tSTAMINA\n${this.monsters
        .map((monster) => monster.toSimpleString())
        .join('\n')}`;
    }

    if (this.canEscape) {
      actions.push({
        label: 'Escape',
        escape: true
      });
    }

    return { actions, label };
  };

  attack() {
    const actions = [];

    this.heroStrenght = this.hero.attack();
    this.monsterStrenght = this.monsters[0].attack();

    let label = `Hero Strenght\tMonster Strenght\n${this.heroStrenght}\t\t\t\t${
      this.monsterStrenght
    }\n`;

    if (this.heroStrenght === this.monsterStrenght) {
      label += '\nDraw';
      actions.push({
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
    let wounded;
    let damage = 2;
    let wasLucky;

    if (testLuck) {
      wasLucky = this.hero.testLuck();
    }

    const monsterWounded = this.heroStrenght > this.monsterStrenght;

    if (monsterWounded) {
      wounded = this.monsters[0];

      if (wasLucky !== undefined) {
        damage += wasLucky ? 2 : -1;
      }
    } else {
      wounded = this.hero;

      if (wasLucky !== undefined) {
        damage += wasLucky ? -1 : 1;
      }
    }

    wounded.updateStamina(-damage);

    if (wounded.stamina >= 1) {
      return {
        label: `${wounded.name} was damage (${damage}).`,
        actions: [
          {
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
        label: `You kill ${monster.name}!`,
        actions: [
          {
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
