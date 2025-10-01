export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore", "ci", "build"]],
    "subject-case": [2, "never", ["upper-case"]],
    "subject-empty": [2, "never"],
    "subject-min-length": [2, "always", 10],
    "type-empty": [2, "never"],
    "scope-case": [2, "always", "lower-case"],
  },
};
