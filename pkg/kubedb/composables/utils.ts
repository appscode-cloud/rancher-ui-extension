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
  return { yamlToJs };
};
