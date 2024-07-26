module.exports = {
    preset: 'ts-jest/presets/default-esm',  // Use ESM support in ts-jest
    globals: {
      'ts-jest': {
        useESM: true
      }
    },
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',  // Properly map module paths for ESM
    },
    extensionsToTreatAsEsm: ['.ts'],
    testEnvironment: 'node',
    transform: {}
};