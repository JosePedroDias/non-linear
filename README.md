We decided to adapt the [Fighting Fantasy](https://www.fightingfantasy.com/) book
[The Warlock of Firetop Mountain](https://www.amazon.co.uk/Fighting-Fantasy-Warlock-Firetop-Mountain/dp/1407181300)

- [play the game](https://josepedrodias.github.io/non-linear/)
- [see the adventure graph](https://josepedrodias.github.io/non-linear/graph.html)
- [documentation](documentation.md)

## small history of how it rolled out

- we decided on doing this as these books were part of our childhood and are a good example of an interactive narrative
- we chose this book as it is the first one and popular
- we found the book in PDF and a word version - we used the former as reference and the 2nd to extract the text and images
- we started to manually parse the narrative into 400 sections with different interaction modes to grasp the features necessary to describe the game rules (these took a lot of time and iterations)
- in parallel a parser was initiated to try to automate the easier, most common actions to try and cover most of the game
- the result of our interpretation of the game can be found in adventure/narrative and scenes json files - the first one was by hand and is deprecated, the second one based on the parsing and hand-tailored to describe the most we could
- the extracted data was converted into a graph several times (graphviz FTW). this allowed us to find errors and aided us in understanding the best book paths to solve the book
- we started with the most basic layout and theme possible. somewhere in the last 24h work was done to make it look decent and stylish
