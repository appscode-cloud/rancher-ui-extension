import { connect, StringCodec, jwtAuthenticator } from "nats.ws";
import { get as getCookie, set as setCookie } from "tiny-cookie";
import type { App } from "vue";
import $axios from "./axios";

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
      ? `wss://10.2.0.42/nats`
      : `ws://10.2.0.42/nats`;
  }

  const sc = StringCodec();
  let _user_jwt: string | null = "";
  let _user_seed: string | null = "";
  async function natsConnect(app: App<Element>) {
    _user_jwt = getCookie("_user_jwt");
    _user_seed = getCookie("_user_seed");

    try {
      if (!_user_jwt || !_user_seed) {
        const resp = await $axios.post(
          `/k8s/clusters/local/apis/rproxy.ace.appscode.com/v1alpha1/proxies`,
          {
            apiVersion: "rproxy.ace.appscode.com/v1alpha1",
            kind: "Proxy",
            request: {
              path: `/api/v1/rancher/nats-cred`,
              verb: "GET",
              query: ``,
              body: "",
            },
          }
        );

        const data = await JSON.parse(resp.data.response?.body);
        setCookie("_user_jwt", data["user-jwt"]);
        setCookie("_user_seed", data["user-seed"]);
      }

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
