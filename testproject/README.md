Attention: chai v.5 does not suports CommonJS no more. Using chia v.4.

    npm init -y
    npm install --save-dev typescript
    npx tsc --init

    tsconfig: 
        outdir: ./dist

    npm install --save-dev mocha @types/mocha chai@"<5.0.0" @types/chai
    npm install --save-dev ts-node 
    npm install --save-dev mocha-junit-reporter

Launching test without reporters:

    npx mocha -r ts-node/register ./tests/**/*.ts

Launching test with reporters:

    npx mocha -r ts-node/register --reporter mocha-junit-reporter ./tests/**/*.ts
