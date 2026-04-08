# KissaWars - Game Mechanics

## Core Loop

Each day the player travels to a new location, which:
1. Advances the day counter
2. Applies 10% interest on outstanding debt
3. Generates new random prices (6-10 drugs available per location)
4. Rolls for a random event (40% chance)

The game ends after 30 days. Final score = cash + bank + inventory value - debt.

## Event Probabilities

A single roll (0.0 - 1.0) determines the event each time the player travels.

| Event        | Roll Range  | Probability | Effect                                      |
|--------------|-------------|-------------|----------------------------------------------|
| No event     | 0.40 - 1.00 | 60%        | Normal market day                            |
| Price Spike  | 0.00 - 0.08 | 8%         | Random drug's price multiplied by 4x         |
| Price Crash  | 0.08 - 0.16 | 8%         | Random drug's price drops to 25%             |
| Police Chase | 0.16 - 0.24 | 8%         | Combat encounter with 1-8 officers           |
| Mugging      | 0.24 - 0.30 | 6%         | Lose 10-40% of cash                          |
| Find Drugs   | 0.30 - 0.36 | 6%         | Find 2-12 units of a random drug             |
| Coat Upgrade | 0.36 - 0.40 | 4%         | Buy +10-30 coat slots for 150-500 rupees     |

### Conditional Cancellations

Some events can be cancelled, falling through to "no event":

- **Police**: 70% chance to cancel if inventory is empty (effective rate ~2.4% when empty)
- **Mugging**: cancelled if player has no cash
- **Find Drugs**: cancelled if coat is full

## Combat System

### Fighting

Per round of fighting:
- Player has a **35%** chance to kill each officer
- Each surviving officer has a **40%** chance to hit, dealing **3-12 damage**
- If health reaches 0, player is knocked out

### Running

- Base **60%** success chance, reduced by inventory fullness (minimum 15%)
  - Formula: `0.6 - (inventorySize / coatSize) * 0.3`
- **On success**: 30% chance to drop up to 50% of each drug type carried
- **On failure**: take `1-8 damage * number of officers` (capped at 20)

### Hospital (Knocked Out)

- Lose **1-3 days**
- Lose **500-2,000 cash** in medical costs
- Health restored to full (100)
- If days exceed 30 after hospital, game ends immediately

## Economy

| Parameter       | Value     |
|-----------------|-----------|
| Starting Cash   | 2,000     |
| Starting Debt   | 5,500     |
| Starting Health | 100       |
| Starting Coat   | 100 slots |
| Max Days        | 30        |
| Debt Interest   | 10%/day   |
| Max Debt        | 50,000    |

## Drug Price Ranges

| Drug         | Real Name       | Min Price | Max Price |
|--------------|-----------------|-----------|-----------|
| Paper        | LSD Tabs        | 1,000     | 4,400     |
| Podi         | Cocaine         | 15,000    | 89,000    |
| Karuppu      | Hashish         | 480       | 1,280     |
| Brown Sugar  | Heroin          | 5,500     | 43,000    |
| Ice          | Methamphetamine | 2,300     | 14,500    |
| Thalagani    | Nicotine Pouch  | 70        | 360       |
| Hans         | Chewable Tobacco| 30        | 230       |
| Thool        | MDA             | 1,500     | 4,400     |
| Abin         | Opium           | 540       | 1,250     |
| Kallu        | Moonshine       | 300       | 2,500     |
| Kaalan       | Shrooms         | 830       | 3,900     |
| Syrup        | Codeine         | 250       | 1,250     |
| Ganja        | Weed            | 315       | 1,900     |

## Locations

| Location      | Bank | Shark | Stash |
|---------------|------|-------|-------|
| Parrys Corner | Yes  | Yes   | Yes   |
| Royapuram     | No   | No    | No    |
| Mylapore      | No   | No    | No    |
| T. Nagar      | Yes  | No    | No    |
| Besant Nagar  | No   | No    | No    |
| Anna Nagar    | No   | No    | No    |

## Game Modes

- **Classic**: Standard gameplay, no price indicators
- **Dealer's Edge**: Adds a min/max price range bar for each drug (based on prices you've observed), and a stats overlay accessible by tapping the status bar
