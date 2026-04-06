# KissaWars - Development Conversation Log

## User
I want to recreate the old DrugWars game in a mobile responsive web app. Create a plan for it.

## Assistant
I have a few questions to shape the plan before diving in.

**Theme:** The project is called 'KissaWars' — 'kissa' means cat in Finnish/Tamil. Should this be a cat-themed reskin of DrugWars, or a straight DrugWars clone with the original theme?

**Stack:** What tech stack do you prefer for the frontend?

**Persistence:** Should the game have persistent state (save/load), or is it a single-session play-through?

**Features:** What features beyond the core DrugWars loop do you want in the initial version?

## User
- Theme: Different theme — "It should be the same drug names. Kissa means 'high' in local Tamil."
- Stack: Vanilla HTML/CSS/JS
- Persistence: LocalStorage saves
- Features: Core + extras (leaderboard, sound effects, animations, polish)

## Assistant
Got it — classic DrugWars gameplay with original drug names, branded as "KissaWars." Here's the implementation plan:

### File Structure
```
KissaWars/
├── index.html              # All screens as <section> elements
├── css/style.css           # Mobile-first retro terminal theme
├── js/
│   ├── data.js             # Static data: drugs, locations, events, price ranges
│   ├── state.js            # Game state, new/save/load, net worth calc
│   ├── sound.js            # Web Audio API procedural synthesis (no audio files)
│   ├── events.js           # Random event roller & dispatch
│   ├── combat.js           # Police fight/run logic
│   ├── leaderboard.js      # High score CRUD
│   ├── ui.js               # DOM rendering, modals, status bars, animations
│   └── game.js             # Orchestrator: init, routing, buy/sell/travel/bank/shark
```

### Game Mechanics (faithful to original)
- **Start**: $2,000 cash, $5,500 debt, 30-day timer, Bronx home base
- **6 locations**: Bronx, Ghetto, Central Park, Manhattan, Coney Island, Brooklyn
- **12 drugs**: Acid, Cocaine, Hashish, Heroin, Ludes, MDA, Opium, PCP, Peyote, Shrooms, Speed, Weed
- **Core loop**: Buy drugs → Travel → Sell drugs → Repeat. Maximize net worth by day 30
- **Debt**: 10% daily compound interest from loan shark
- **Bank**: Deposit/withdraw cash (safe from mugging)
- **Stash**: Store/retrieve drugs at home base
- **Random events**: Price spikes, crashes, police, muggings, finding drugs, coat upgrades
- **Combat**: Fight/run against officers

### Visual Style
- Retro terminal: near-black bg, green text, monospace font
- CRT scanline overlay
- Min 48px tap targets, mobile-first
- Web Audio API procedural sound (no audio files)

### Implementation Order
1. Skeleton (HTML, CSS, data, state)
2. Core Loop (market, buy/sell, travel)
3. Financial Systems (bank, shark, stash)
4. Events & Combat
5. Endgame (game over, leaderboard)
6. Polish (sound, animations)

---

## User
Continue with the implementation. Why did you stop?

## Assistant
On it. All files were created:

- `index.html` — all 10 screens, quantity modal, toast notification
- `css/style.css` — retro terminal theme, mobile-first, CRT scanlines, animations
- `js/data.js` — 12 drugs, 6 locations, event templates, game constants
- `js/state.js` — game state, save/load, price generation, net worth calc
- `js/sound.js` — 8 procedural sounds via Web Audio API (no audio files)
- `js/events.js` — 6 random event types with weighted probabilities
- `js/combat.js` — police fight/run mechanics, hospital system
- `js/leaderboard.js` — top 20 high scores in localStorage
- `js/ui.js` — all screen rendering, quantity/amount modals, toast, typewriter effect
- `js/game.js` — game orchestrator: buy/sell/travel/bank/shark/stash/game-over

To play: Open `index.html` in a browser — no server needed.

---

## User
Can you test the entire game using a browser?

## Assistant
Tested the full game flow using a headless browser at mobile viewport (375x812):

### QA Test Results

| Feature | Status | Notes |
|---------|--------|-------|
| Title screen | Pass | Logo, subtitle, New Game, Leaderboard, Sound toggle |
| Continue button | Pass | Appears when save exists in localStorage |
| Market screen | Pass | Status bar, drug prices, BUY/SELL buttons |
| Buy drugs | Pass | Modal with quantity input, slider, MAX, total calc |
| Sell drugs | Pass | Correct revenue, inventory updates, toast notification |
| Travel | Pass | 6 locations, current disabled, day increments |
| Random events | Pass | Police encounter triggered naturally |
| Combat | Pass | Fight/Run, health bar, officer count, damage messages |
| Combat victory | Pass | "Defeated all cops" event, returns to market |
| Bank | Pass | Deposit/withdraw, cash/bank balance updates |
| Loan Shark | Pass | Shows debt, interest rate, borrow/repay buttons |
| Stash | Pass | Store/retrieve drugs, inventory/stash counts |
| Debt interest | Pass | Compounds 10% daily (5,500 → 6,050 → 6,655) |
| Game Over | Pass | Net worth, stats summary, name input |
| Leaderboard | Pass | Saves score, displays ranked table with date |
| Save/Load | Pass | Persists across page reload |
| Responsive | Pass | Mobile, tablet, desktop all look good |
| Console errors | Pass | Zero errors |

**One bug found and fixed during testing:** The status bar was placed outside the screen sections, making it invisible due to `overflow: hidden` on body. Moved it back inside the market screen.

---

## User
Can we write unit tests for this?

## Assistant
Bun is available and has a built-in test runner — zero dependencies needed. Created test files:

- `tests/setup.js` — mocks browser globals (window, document, localStorage, AudioContext)
- `tests/state.test.js` — 28 tests for money formatting, randInt, newGame, inventory/stash/net worth, prices, save/load, settings
- `tests/events.test.js` — 24 tests for all 6 event types, coat choice handling, event roller distribution
- `tests/combat.test.js` — 12 tests for fight/run mechanics, startCombat, endCombat, hospital costs
- `tests/leaderboard.test.js` — 9 tests for save/retrieve, sorting, max entries, HTML escaping
- `tests/game-logic.test.js` — 28 tests for buy/sell, travel, debt compounding, stash, data integrity

**Result: 101 tests, all passing in 28ms.**

Run them anytime with `bun test`.

---

## User
I want to use locations in Chennai instead of New York. Also I want to use local Tamil names for the drugs.

## Assistant
Updated all locations and drug names:

### Locations (NYC → Chennai)

| Old | New |
|-----|-----|
| The Bronx (home) | Parrys Corner (home) |
| The Ghetto | Royapuram |
| Central Park | Mylapore |
| Manhattan | T. Nagar |
| Coney Island | Besant Nagar |
| Brooklyn | Anna Nagar |

### Drugs (English → Tamil street names)

| Old | New | Meaning |
|-----|-----|---------|
| Acid | Paper | LSD tabs |
| Cocaine | Podi | Powder |
| Hashish | Charas | Hashish |
| Heroin | Brown Sugar | Common Indian street name |
| Ludes | Maathirai | Pills |
| MDA | Thool | Dust |
| Opium | Kasakasa | Poppy |
| PCP | Kallu | Toddy/moonshine |
| Peyote | Kaattaan | Wild stuff |
| Shrooms | Kaalan | Mushroom |
| Speed | Vega | Velocity |
| Weed | Ganja | Same in Tamil |

### Events also localized
- "subway" → "bus stand"
- "Officer Hardass" → "Inspector Ravi"
- "trenchcoat" → "lungi-bag"
- "thugs" → "rowdies"
- Added "tea kadai" references

All 101 tests updated and passing.

---

## User
Use rupees symbol.

## Assistant
Updated `formatMoney` to use `₹` with Indian number formatting (lakhs grouping via `en-IN` locale). For example: `₹12,34,567`.

All 101 tests pass.

---

## User
Let's use aruvaal instead of a gun.

## Assistant
Updated combat to reference the aruvaal (machete):

- **FIGHT button** → **ARUVAAL**
- Combat messages: *"Your aruvaal took out 2 cops!"*, *"You swung the aruvaal but missed..."*, *"You slashed through them all!"*
- Game over stats: *"Aruvaal fights: 7"*

All 101 tests pass.
