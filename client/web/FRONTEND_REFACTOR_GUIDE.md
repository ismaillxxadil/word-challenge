# Frontend Refactor Guide (Next.js)

## Scope Reviewed

Reviewed the current frontend code in `client/web`, with focus on game flow and room lifecycle:

- `app/[room_id]/page.tsx`
- `app/[room_id]/gamePage.tsx`
- `app/[room_id]/LobbyPage.tsx`
- `app/[room_id]/game/*`
- `store/useRoomStore.ts`
- `hooks/useSound.ts`
- shared UI components (`components/*`)

---

## Executive Summary

Your frontend is **functional and feature-rich**, and several parts are already good enough to keep.

The main scalability risk is not code quality in isolated components, but **too much behavior concentrated in a few large files** (especially `gamePage.tsx` and `LobbyPage.tsx`) plus **network/socket orchestration mixed into UI logic**.

If you want long-term stability and easier feature growth, refactor toward:

1. **SOLID boundaries** (UI vs domain vs infrastructure)
2. **State Pattern** for game phases (`lobby`, `in-game`, `var`, `game-over`)
3. A thin socket service/facade layer to isolate transport events from React components

---

## What Is Already Good (Keep These)

1. **Component decomposition exists** for many view parts (`CenterBoard`, `PlayCard`, `PlayerInfo`, `VarVotingLayer`, `GameOverModal`), which is a strong base.
2. **Shared store is already centralized** in Zustand (`useRoomStore.ts`), which simplifies room-level state access.
3. **Type modeling is present** in `app/types.ts` (players, room state, VAR session) and gives a good starting point for domain refinement.
4. **UX handling is strong** (animations, feedback, toasts, timed transitions), which means refactor can focus on architecture without losing game feel.

Conclusion: the codebase is **not bad** and does **not need a rewrite**. It needs **structural refactoring**.

---

## SOLID Audit

## S — Single Responsibility Principle

### Issues

- `app/[room_id]/gamePage.tsx` currently handles:
  - socket event subscriptions
  - turn/timer logic
  - card selection and validation flow
  - wildcard flow
  - animation orchestration and DOM measurements
  - sound triggers
  - overlay rendering and UI composition

This is multiple responsibilities in one component.

- `LobbyPage.tsx` contains both lobby rendering and a heavy settings modal domain.

### Refactor Goal

- Split into focused hooks/services/components:
  - `useGameSession()` for session-level derived state
  - `useCardPlayFlow()` for card interactions + server play action
  - `useTurnTimer()` for turn countdown
  - `useGameSocketEvents()` for event wiring
  - `GameLayout` purely presentational

---

## O — Open/Closed Principle

### Issues

- Adding a new game phase or rule requires editing large conditional blocks in `gamePage.tsx`.
- Rule checks are embedded in UI paths, so extension requires touching existing files.

### Refactor Goal

- Use **State Pattern** so each phase encapsulates its own behavior and transitions.
- Introduce rule evaluators (strategies) for rule-specific validations.

---

## L — Liskov Substitution Principle

### Current State

- Limited class polymorphism in this codebase; mostly functional React.
- No major LSP violation found.

### Risk

- Implicit contracts between server payloads and UI assumptions can break substitutability.

### Refactor Goal

- Add runtime guards for socket payloads and narrow types before state updates.

---

## I — Interface Segregation Principle

### Issues

- Several components receive broad prop shapes, even when they need only a subset.
- Store actions are broad and transport-specific.

### Refactor Goal

- Define smaller feature-level interfaces:
  - `CardPlayActions`
  - `VarActions`
  - `RoomConnectionActions`

---

## D — Dependency Inversion Principle

### Issues

- UI components depend directly on `socket.emit` event names and API endpoints.
- `fetch` calls and transport concerns are embedded in page components.

### Refactor Goal

- Depend on abstractions:
  - `GameGateway` interface
  - `RoomApi` interface
  - `SoundPort` interface
- Implement these in infrastructure (`socketGameGateway`, `httpRoomApi`, `howlerSoundPort`).

---

## Design Pattern to Adopt: State Pattern (Primary)

Use a `GamePhaseState` abstraction to isolate behavior by phase.

Example conceptual model:

```ts
type PhaseName = "lobby" | "in-game" | "var" | "pending-win" | "game-over";

interface GamePhaseState {
  name: PhaseName;
  canPlayCard(ctx: GameContext): boolean;
  canDraw(ctx: GameContext): boolean;
  canStartVar(ctx: GameContext): { ok: boolean; reason?: string };
  next(ctx: GameContext, event: GameEvent): PhaseName;
}
```

Implement per phase:

- `LobbyPhaseState`
- `InGamePhaseState`
- `VarPhaseState`
- `GameOverPhaseState`

Why this pattern fits your game:

- Your game is naturally phase-driven.
- Rules differ by phase.
- It avoids giant condition chains and reduces regressions when adding features.

---

## Target Frontend Structure (Suggested)

```text
client/web/
  features/
    room/
      api/
        roomApi.ts
      services/
        roomConnectionService.ts
      state/
        roomStore.ts
      ui/
        RoomJoinModal.tsx
        LobbyView.tsx

    game/
      domain/
        phase/
          GamePhaseState.ts
          LobbyPhaseState.ts
          InGamePhaseState.ts
          VarPhaseState.ts
          GameOverPhaseState.ts
        rules/
          VarEligibilityRule.ts
          RepeatWordRule.ts

      application/
        useGameSession.ts
        useCardPlayFlow.ts
        useTurnTimer.ts
        useGameSocketEvents.ts

      infrastructure/
        socketGameGateway.ts

      ui/
        GameView.tsx
        overlays/
        board/
        players/

  shared/
    sound/
      SoundPort.ts
      howlerSoundPort.ts
    types/
      game.ts
      room.ts
```

---

## Phased Refactor Plan (Safe, Incremental)

## Phase 0 — Baseline Safety (No UX change)

1. Add focused type aliases and derived selectors in `app/types.ts` or new `shared/types/*`.
2. Introduce constants for socket event names.
3. Add small runtime guards for critical socket payloads.

## Phase 1 — Extract Hooks from `gamePage.tsx`

1. Extract `useTurnTimer`.
2. Extract `useGameSocketEvents` (VAR + restart + room updates).
3. Extract `useCardPlayFlow` (selection, play, wildcard).
4. Keep `gamePage.tsx` only as composition + rendering.

## Phase 2 — Introduce `GameGateway` (DIP)

1. Replace direct `socket.emit` calls in UI with gateway methods.
2. Keep socket implementation in one file (`socketGameGateway.ts`).
3. Gateway methods:
   - `playCard(...)`
   - `drawAndPass(...)`
   - `startVar(...)`
   - `submitVarVote(...)`
   - `startGame(...)`, `resetToLobby(...)`

## Phase 3 — Apply State Pattern

1. Implement phase state objects.
2. Replace broad `if (state.phase === ...)` branches with phase object checks.
3. Keep UI components phase-agnostic where possible (`canStartVar`, `canPlayCard`, etc.).

## Phase 4 — Clean Store Boundaries

1. Split current `useRoomStore` into:
   - connection/session store
   - settings store
2. Move socket lifecycle out of store into `roomConnectionService`.

---

## Specific Current Hotspots

1. `app/[room_id]/gamePage.tsx`
   - too large, too many responsibilities, high change risk
2. `app/[room_id]/LobbyPage.tsx`
   - settings modal + host actions + room rendering bundled together
3. `store/useRoomStore.ts`
   - combines state container and transport orchestration
4. `app/[room_id]/page.tsx`
   - join flow + localStorage + transport flow in same component

---

## Suggested First Refactor PRs

## PR-1 (low risk)

- Extract `useTurnTimer`
- Extract `useVarSessionUi`
- No behavior change

## PR-2 (medium risk)

- Add `GameGateway` abstraction
- Move all `socket.emit` out of UI components

## PR-3 (medium/high)

- Introduce `GamePhaseState` and wire `in-game` + `var` first
- Keep fallback branches for unimplemented phases during migration

## PR-4 (medium)

- Split `LobbyPage.tsx` into `LobbyView`, `SettingsModal`, `LobbyActions`

---

## Stability & Scalability Metrics to Track

Track these before/after each phase:

1. Max component file length (`gamePage.tsx` target: < 300 lines)
2. Number of direct `socket.emit` usages inside UI components (target: 0)
3. Number of phase-related `if` condition chains in UI (target: near 0)
4. Regression bugs on turn flow/VAR flow after new feature additions

---

## Final Verdict

- The frontend is **already good in UX and feature coverage**.
- It **does need refactoring** for long-term maintainability.
- Recommended architecture direction: **SOLID + State Pattern + gateway abstraction**.
- Prefer incremental refactor over rewrite.

---

## Optional Next Step

If you want, the next step is to implement **Phase 1 only** now (extract hooks from `gamePage.tsx`) with zero UI behavior change, then continue phase by phase.
