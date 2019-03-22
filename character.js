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

  const potion = window.prompt('Which potion do you like to have (skill, strength, fortune)', 'strength')

  return new Character({
    name,
    skill,
    stamina,
    potion,
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
  constructor({ luck, potion, ...rest }) {
    super(rest);

    this.luck = new Attribute('luck', luck);
    this.meal = new Attribute('meal', 10);

    switch (potion) {
      case 'skill':
        this.drinkPotion = this.drinkPotionOfSkill;
        break;
      case 'strength':
        this.drinkPotion = this.drinkPotionOfStrength;
        break;
      case 'fortune':
        this.drinkPotion = this.drinkPotionOfFortune;
        break;
    }
  }

  haveMeals() {
    return this.meal >= 1;
  }

  eat(force) {
    this.meal.update(-1);
    this.stamina.update(4, force);

    return this;
  }

  drinkPotionOfSkill() {
    this.skill.restore();

    delete this.drinkPotion;

    return this;
  }

  drinkPotionOfStrength() {
    this.stamina.restore();

    delete this.drinkPotion;

    return this;
  }

  drinkPotionOfFortune() {
    this.luck
      .restore()
      .update(1, true);

    delete this.drinkPotion;

    return this;
  }
  
  updateMeal(value, force) {
    this.meal.update(value, force);

    return this;
  };
  
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
      damage += this.hero.testLuck() ? -1 : 1;
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

    this.heroStrenght = this.hero.attack();
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
        label: `${wounded.name} was wounded (${damage}).`,
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
