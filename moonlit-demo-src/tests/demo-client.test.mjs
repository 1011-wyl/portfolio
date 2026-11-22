import test from 'node:test';
import assert from 'node:assert/strict';
import { getDemoClient, DEFAULT_ASSIGNED_ROLES } from '../lib/demo-client.ts';

test('browser demo client advances host transitions, concurrent choices and ballots to a replay', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: Date.now() });
  const client = getDemoClient();
  client.startGame({ mode: 'director', role: 'random', god: true, assigned: DEFAULT_ASSIGNED_ROLES });
  const phases = new Set();
  let game;
  for (let step = 0; step < 2000; step++) {
    game = client.getSnapshot().game;
    if (game.winner) break;
    phases.add(game.task?.type);
    if (game.awaitingAdvance) client.advanceSpeech();
    else client.step();
    t.mock.timers.tick(6000);
  }
  assert(game.winner, 'director demo should reach a winner');
  assert(phases.has('wolfStart'), 'host transition after wolf chat is exercised');
  assert(phases.has('sheriffVoteStart'), 'sheriff ballot is exercised');
  const snapshot = client.getSnapshot();
  assert.equal(snapshot.history[0].id, game.id);
  assert.equal(client.getReplay(game.id).players.filter(player => player.role).length, 12);
});
