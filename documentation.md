# documentation

## project structure

The game spawns from the `index.html` file.

The game logic is divided into `engine.js` and `character.js`.  
Engine drives the section and interaction of the book.  
Character enforces the game logic and internal state by defining and managing its instances.  
It exposes a simple public API for engine to consume.

The game itself is described in the JSON file under the adventure folder.

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

## how to write sections

A section (in the book they span from 0 aka rumours up to 400), is the basic unit of interaction on fighting fantasy books. Besides its key, it must have at least a text attribute (string with the textual content, with newlines to break paragraphs). It can also have an image to illustrate it. The interaction part is optional but is critical to make the section provide any interaction to the reader/player. It not present, the player gets to a dead end.

## how to write interactions

An interaction is valid JSON. We tried to come up with a way to describe rules in a flexible way.

calling actions is done by sending an array such as `["goTo", "2"]`.

Those are wrapped in objects. There are several types:

`{"do": [action]}`

`{"sequence": [array of actions]}`

`{"oneOf": [array of actions]}`

`{"lucky": [action to perform if test luck succeeded], "unlucky": [action to perform if test luck did not succeed]}`

`{"fight": [array of creatures], "escape": [optional action], "beatEmUp": [optional boolean]}`

`{"if": [action], "then": [action if if passed], "else": [action if if failed]}`

do's and sequences support an optional label. If there, a button is displayed for the player to choose.
The most common example is those being wrapped in an oneOf. (ie. choose between 2 pages, choose to )
