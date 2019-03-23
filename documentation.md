# documentation

## which status names exist?

- stamina
- skill
- luck
- gold

## which equipmentConstants exist?

    +---------------------+--------+
    | constant name       | type   |
    +---------------------+--------+
    | circularIronShield  | shield |
    | bronzeHelmet        | helmet |
    | ironHelmet          | helmet |
    | gleamingSword       | sword  |
    +---------------------+--------+

## supported actions and their signatures?

`updateStatus(name, deltaV, force?)`
`takeItem(name)`
`dropItem(name)`

`equipItem(equipmentConstant)`

`goTo(sectionName)`
