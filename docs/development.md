# Development guide

```bash
sam local invoke FnAdapterBolcomWebsitePoller --event events/event-cloudwatch-event.json --env-vars env-test.json 


```

## Typescript setup

In the

```json
"scripts": {
    "test": "jest",
    "build": "tsc && npm run copy-dependencies",
    "copy-dependencies": "cpy --cwd=src --parents '**/*' '!**/*.ts' '!**/*.js' '!**/node_modules' ../dist/",
    "install-d": "find src/. -type d \\( -name node_modules -o -path name \\) -prune -false -o -name 'package.json' -execdir npm i \\;"
}
```
