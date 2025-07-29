import { parse } from "yaml";
export const useUtils = () => {
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

  return { yamlToJs, getRandomUUID };
};
