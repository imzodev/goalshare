export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore", "ci", "build"]],
    "subject-case": [2, "never", ["upper-case"]],
    "subject-empty": [2, "never"],
    "subject-min-length": [2, "always", 10],
    "type-empty": [2, "never"],
    "scope-case": [2, "always", "lower-case"],
    // Require a blank line between header and body
    "body-leading-blank": [2, "always"],
    // Allow body lines up to 140 chars
    "body-max-line-length": [2, "always", 140],
  },
};
