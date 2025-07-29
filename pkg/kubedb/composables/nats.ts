import { connect, StringCodec, jwtAuthenticator } from "nats.ws";
import { get as getCookie, set as setCookie } from "tiny-cookie";
import type { App } from "vue";

export const useNats = () => {
  function bytes(str: string) {
    let data: Array<number> = [];

    for (let i = 0; i < str?.length; ++i) {
      const code = str.charCodeAt(i);

      data = data.concat([code]);
    }

    return data;
  }

  function getWebSocketServer() {
    const hostname = window.location.hostname;
    if (hostname.search("bb.test") !== -1) {
      return "ws://bb.test:31222"; // dev
    } else if (hostname === "appscode.ninja" || hostname === "appscode.com") {
      return `wss://nats.${hostname}`;
    }
    //self host
    const protocol = window.location.protocol;
    return protocol === "https:"
      ? `wss://${hostname}/nats`
      : `ws://${hostname}/nats`;
  }

  const sc = StringCodec();
  async function natsConnect(app: App<Element>) {
    try {
      // Set cookies before using them
      // setCookie("_user_jwt", jwt, {
      //   path: "/",
      //   secure: false,
      //   domain: "10.2.0.42",
      // });
      // setCookie("_user_seed", seed, {
      //   path: "/",
      //   secure: false,
      //   domain: "10.2.0.42",
      // });

      const natsConnection = await connect({
        servers: getWebSocketServer(),
        authenticator: jwtAuthenticator(
          getCookie("_user_jwt") as string,
          bytes(getCookie("_user_seed") as string) as unknown as Uint8Array
        ),
      });
      app.config.globalProperties.$nc = natsConnection;
    } catch (e) {
      console.log(e);
      console.log(`error connecting to nats server`);
    }
  }

  return {
    getWebSocketServer,
    natsConnect,
    sc,
  };
};
