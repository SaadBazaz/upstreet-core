// import { NetworkRealms } from '../sdk/lib/multiplayer/public/network-realms.mjs';

// const devServerPort = 10618;
// const devServerUrl = `http://local.upstreet.ai:${devServerPort}`;

import Usdk from 'usdk';

test('basic chat reply', async () => {
  const usdk = new Usdk();
  expect(usdk).toBeTruthy();

  // // make the agent join the room
  // const joinRes = await fetch(`${devServerUrl}/join`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // });
  // expect(joinRes.ok).toStrictEqual(true);

  // const realms = new NetworkRealms({
  //   endpointUrl: multiplayerEndpointUrl,
  //   playerId: !anonymous ? userId : null,
  //   audioManager: null,
  // });
});
