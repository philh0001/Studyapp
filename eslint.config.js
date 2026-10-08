import js from '@eslint/js';
import ts from 'typescript-eslint';
export default ts.config({ignores:['dist/**','node_modules/**']},js.configs.recommended,...ts.configs.recommended,{files:['**/*.{ts,tsx,mjs}'],languageOptions:{globals:{console:'readonly',process:'readonly',URL:'readonly',fetch:'readonly',setTimeout:'readonly',Buffer:'readonly'}},rules:{'@typescript-eslint/no-explicit-any':'off','@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}]}});
