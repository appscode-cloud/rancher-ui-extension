export function useRequiredRule() {
  const required = (value: unknown) => {
    if (!!value || value === 0) {
      if (Array.isArray(value) && value.length > 0) return "";
      else if (typeof value === "object" && Object.keys(value).length > 0)
        return "";
      if (typeof value === "string" && value.length > 0) return "";
      if (typeof value === "boolean" || typeof value === "number") return "";
    }
    return "This field is required";
  };
  return {required}
}
