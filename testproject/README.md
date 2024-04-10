ATTENZIONE: chai 5 non supporta piu CommonJS quindi con chai 5 non va cosi

    npm init -y
    npm install --save-dev typescript
    npx tsc --init

    tsconfig: 
        outdir: ./dist

    npm install --save-dev mocha @types/mocha chai@"<5.0.0" @types/chai
    npm install ts-node

Per laciarli:

    npx mocha -r ts-node/register ./tests/**/*.ts