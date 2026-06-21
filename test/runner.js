const state = {
  currentSuite: null,
  suites: [],
  currentTest: null,
  results: [],
  passed: 0,
  failed: 0,
};

function indent(level) {
  return '  '.repeat(level);
}

function color(str, code) {
  return `\x1b[${code}m${str}\x1b[0m`;
}

const colors = {
  green: (s) => color(s, '32'),
  red: (s) => color(s, '31'),
  yellow: (s) => color(s, '33'),
  gray: (s) => color(s, '90'),
  cyan: (s) => color(s, '36'),
  bold: (s) => color(s, '1'),
};

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object') return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (Array.isArray(a) || Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

function createExpect(actual) {
  let not = false;

  const assert = (pass, message) => {
    if (not) pass = !pass;
    if (!pass) {
      throw new Error(message);
    }
  };

  const expectObj = {
    get not() {
      not = true;
      return expectObj;
    },

    toBe(expected) {
      const pass = actual === expected;
      assert(pass, `expected ${JSON.stringify(actual)} ${not ? 'not ' : ''}to be ${JSON.stringify(expected)}`);
    },

    toEqual(expected) {
      const pass = deepEqual(actual, expected);
      assert(pass, `expected ${JSON.stringify(actual)} ${not ? 'not ' : ''}to equal ${JSON.stringify(expected)}`);
    },

    toBeTruthy() {
      const pass = !!actual;
      assert(pass, `expected ${JSON.stringify(actual)} ${not ? 'not ' : ''}to be truthy`);
    },

    toBeFalsy() {
      const pass = !actual;
      assert(pass, `expected ${JSON.stringify(actual)} ${not ? 'not ' : ''}to be falsy`);
    },

    toBeGreaterThan(expected) {
      const pass = actual > expected;
      assert(pass, `expected ${actual} ${not ? 'not ' : ''}to be greater than ${expected}`);
    },

    toBeLessThan(expected) {
      const pass = actual < expected;
      assert(pass, `expected ${actual} ${not ? 'not ' : ''}to be less than ${expected}`);
    },

    toContain(item) {
      let pass = false;
      if (Array.isArray(actual) || typeof actual === 'string') {
        pass = actual.includes(item);
      }
      assert(pass, `expected ${JSON.stringify(actual)} ${not ? 'not ' : ''}to contain ${JSON.stringify(item)}`);
    },

    toHaveLength(expected) {
      const pass = actual.length === expected;
      assert(pass, `expected length ${actual.length} ${not ? 'not ' : ''}to be ${expected}`);
    },

    toThrow(expectedMessage) {
      let thrown = false;
      let errorMessage = '';
      try {
        actual();
      } catch (e) {
        thrown = true;
        errorMessage = e.message;
      }
      let pass = thrown;
      if (pass && expectedMessage !== undefined) {
        pass = errorMessage.includes(expectedMessage);
      }
      assert(pass, thrown
        ? `expected error message "${errorMessage}" ${not ? 'not ' : ''}to contain "${expectedMessage}"`
        : `expected function ${not ? 'not ' : ''}to throw`);
    },

    toBeInstanceOf(Constructor) {
      const pass = actual instanceof Constructor;
      assert(pass, `expected value ${not ? 'not ' : ''}to be instance of ${Constructor.name}`);
    },
  };

  return expectObj;
}

export function describe(name, fn) {
  const suite = { name, tests: [], children: [], level: state.currentSuite ? state.currentSuite.level + 1 : 0 };
  if (state.currentSuite) {
    state.currentSuite.children.push(suite);
  } else {
    state.suites.push(suite);
  }
  const prev = state.currentSuite;
  state.currentSuite = suite;
  fn();
  state.currentSuite = prev;
}

export function it(name, fn) {
  if (!state.currentSuite) {
    throw new Error('it() must be called inside describe()');
  }
  state.currentSuite.tests.push({ name, fn });
}

export function expect(actual) {
  return createExpect(actual);
}

function runTest(test) {
  try {
    test.fn();
    return { passed: true };
  } catch (e) {
    return { passed: false, error: e };
  }
}

function runSuite(suite) {
  const results = [];
  for (const test of suite.tests) {
    const result = runTest(test);
    results.push({ name: test.name, ...result, level: suite.level + 1 });
    if (result.passed) state.passed++;
    else state.failed++;
  }
  for (const child of suite.children) {
    results.push(...runSuite(child));
  }
  return results;
}

function printSuite(suite, results, index = { i: 0 }) {
  console.log(indent(suite.level) + colors.bold(suite.name));
  for (const test of suite.tests) {
    const result = results[index.i++];
    if (result.passed) {
      console.log(indent(test ? 0 : 0) + '  '.repeat(suite.level + 1) + colors.green('✓ ') + test.name);
    } else {
      console.log(indent(suite.level + 1) + colors.red('✗ ') + test.name);
    }
  }
  for (const child of suite.children) {
    printSuite(child, results, index);
  }
}

function printErrors(results) {
  const failures = results.filter(r => !r.passed);
  if (failures.length === 0) return;

  console.log('');
  console.log(colors.red(colors.bold('Failures:')));
  failures.forEach((failure, i) => {
    console.log('');
    console.log(colors.red(`  ${i + 1}) ${failure.name}`));
    const lines = failure.error.stack ? failure.error.stack.split('\n') : [failure.error.message];
    lines.forEach(line => {
      console.log(colors.gray('     ' + line));
    });
  });
}

export async function runTests(testFiles) {
  for (const file of testFiles) {
    await import(file);
  }

  const allResults = [];
  for (const suite of state.suites) {
    allResults.push(...runSuite(suite));
  }

  console.log('');
  for (const suite of state.suites) {
    printSuite(suite, allResults);
  }

  printErrors(allResults);

  console.log('');
  console.log(colors.bold(`Tests: ${state.passed} passed, ${state.failed} failed, ${state.passed + state.failed} total`));

  return state.failed === 0;
}
