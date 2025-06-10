import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
export default [
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            'arrow-body-style': ['error', 'as-needed'],
            'no-unused-vars': 'off',
            // "@typescript-eslint/no-unused-vars": ["error", {"argsIgnorePattern": "^_"}], // Disables unused variables, ignoring arguments starting with _

            '@typescript-eslint/ban-ts-comment': 'off', // Allows comments like @ts-ignore
            'no-prototype-builtins': 'off', // Allows prototype methods to be used directly
            '@typescript-eslint/no-empty-function': 'off', // Allow empty functions

            '@typescript-eslint/explicit-function-return-type': 'warn', // Requires explicit indication of the function return type
            '@typescript-eslint/no-inferrable-types': 'warn', // Warns about overspecifying types that can be inferred automatically
            '@typescript-eslint/no-namespace': 'error', // Disables the use of namespaces
            '@typescript-eslint/no-var-requires': 'error', // Disables the use of require for imports
            '@typescript-eslint/consistent-type-assertions': 'warn', // Ensures consistent use of casting
            // "@typescript-eslint/no-unused-expressions": "warn", // Warns about unused expressions
            '@typescript-eslint/consistent-type-definitions': [
                'error',
                'interface',
            ], // Requires the use of interfaces instead of types
            // "@typescript-eslint/no-explicit-any": "warn", // Warns about using type any
            // "@typescript-eslint/no-misused-promises": "error", // Prohibits the misuse of promises
            // "@typescript-eslint/no-non-null-assertion": "warn", // Warns about using the !
            '@typescript-eslint/prefer-optional-chain': 'warn', // Prefers to use optional chaining,
            '@typescript-eslint/no-unnecessary-condition': 'warn', // Warns about conditions that are always true or false
            '@typescript-eslint/prefer-nullish-coalescing': 'warn', // Prefers to use the ?? operator
            '@typescript-eslint/no-floating-promises': 'error', // Requires promise processing
            '@typescript-eslint/await-thenable': 'error', // Ensures that await is only used with Promises

            'array-callback-return': 'error', // Requires return value from array callback functions
            eqeqeq: ['error', 'always'], // Requires === and !==
            'no-duplicate-imports': 'error', // Prevents duplicate imports
            'no-return-await': 'error', // Prevents unnecessary use of await in return
            'no-useless-concat': 'error', // Prevents unnecessary concatenation of strings
            'prefer-const': 'error', // Requires the use of const for immutable variables
            'prefer-template': 'warn', // Prefers the use of template strings
            radix: 'error', //Requires a radix for the parseInt function
            'no-var': 'error', // Disables the use of var
            'no-throw-literal': 'error', // Prevents throwing literals as exceptions
            'no-async-promise-executor': 'error', //Disables asynchronous promise executors
            'no-await-in-loop': 'warn', //Warns about await in loops
            'no-constant-binary-expression': 'error', // Disables constant binary expressions
            'no-use-before-define': [
                'error',
                { functions: false, classes: true },
            ], // Prevents the use of variables before they are declared
            curly: ['error', 'all'], // Requires curly braces for all control blocks
            'default-param-last': 'error', // Requires default settings to be latest
            'dot-notation': 'error', // Requires the use of dot notation whenever possible
            'no-else-return': 'error', //Disables else after return
            'no-empty-function': 'warn', // Warns about empty functions
            'no-loop-func': 'error', // Prevents the creation of functions inside loops
            'no-useless-return': 'error', // Prohibits unnecessary returns
            'prefer-arrow-callback': 'warn', // Prefers arrow functions for callbacks
            'prefer-rest-params': 'error', // Prefers rest parameters instead of arguments
            'prefer-spread': 'error', // Prefers spread operator instead of .apply()

            'no-console': 'warn', // Warns about using console.log
        },
    },
    {
        files: ['**/*.js', '**/*.jsx'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
        },
    },
];
