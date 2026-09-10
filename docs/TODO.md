
## Design decisions: 

- what percentage idle game vs factory game
  - Offline progress?
  - Global resources vs local resources?
  - Electricity?  
- How to play up nature vs science
  - Nature: Abundance. Growth. Simplicity.
  - Science: Progress. Complexity.
- How is land taken?
 - Air (large swaths at once, like purifier towers/trees with large upgront or ongoing costs)
 - Earth (one tile at a time, maybe the map is always unlocked and tiles just need irrigation or tilling)
- Procedural? Handcrafted? Both? 

## Minimal Vertical slice (Putting the pieces together)
I want to be able to click on a tile, place a 'miner' down, refresh the page, and it will still be there.
That 'miner' should generate a resource, which can  be collected and used to make more miners. 

## Basics 
- Render Loop
  - Basic canvas resize
  - basic 
- Compiler eval loop
  - As good as it can get without a browser callback

## Save Game
- save and load from cookies
- save and load from clipboard
- Save game type 
  - migrations
  - initializers

## Interactions
- Camera
  - movement
    - click and drag
    - WASD drag
    - mousewheel zoom
  - infinite scroll
    - 9 slice centered around camera? (could be 7 slice with hexes)
  
## Gameplay loop 
- Terrain generation 
  - seeded? Editable and saveable? 
- Hover to highlight  
- Game object creation
  - game object definitions
- Research
  - Unlocks
  - Upgrades

## Assets 
- tiles
  - grassland
  - water
  - desert
- Buildings
  - Belt
    - straight
    - slight bend
  - plant
  - miner
  - harvester?
  - 'furnace' 
