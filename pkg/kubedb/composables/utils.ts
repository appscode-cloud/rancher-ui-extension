import { parse } from "yaml";
import { useStore } from "vuex";

export const useUtils = (store?: any) => {
  function yamlToJs(yamlString: string): Record<string, any> {
    try {
      const result = parse(yamlString);
      return result;
    } catch (error) {
      throw new Error(`YAML parsing failed: ${(error as Error).message}`);
    }
  }

  function getRandomUUID() {
    // declare custom function to generate uuid if crypto.randomUUID is not available
    // https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid/2117523#2117523
    function uuidv4() {
      // @ts-ignore
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
      );
    }
    if (self.crypto.randomUUID) {
      return self.crypto.randomUUID();
    } else {
      return uuidv4();
    }
  }

  function getPercentage(a: number, b: number): string {
    if (b === 0) {
      return "Infinity%";
    }
    const percentage = (a / b) * 100;
    return `${percentage.toFixed(2)}%`;
  }

  function extractNumbers(input: string): [number, number] {
    const matches = input.match(/\d+/g);

    if (!matches || matches.length !== 2) {
      throw new Error("Input string must contain exactly two numbers");
    }

    return [parseInt(matches[0], 10), parseInt(matches[1], 10)];
  }

  const getClusters = async (clusterId: string) => {
    const storeInstance = store || useStore();
    let clusterName = "";
    try {
      const result = await storeInstance.dispatch("management/findAll", {
        type: "management.cattle.io.cluster",
      });
      result.forEach((ele: { id: string; spec: { displayName: string } }) => {
        if (ele.id === clusterId) {
          clusterName = ele.spec.displayName;
        }
      });
    } catch (e) {
      console.log(e);
    }
    return clusterName;
  };

  function convertToLocal(input: any) {
    const date = new Date(input);

    if (isNaN(date.getTime())) {
      return null;
    }

    return date.toString();
  }

  function convertLocalToISO8601(input: string): string | null {
    const date = new Date(input);

    if (isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  }

  return {
    convertToLocal,
    convertLocalToISO8601,
    yamlToJs,
    getRandomUUID,
    getPercentage,
    getClusters,
    extractNumbers,
  };
};
