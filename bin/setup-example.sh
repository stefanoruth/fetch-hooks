#!/bin/bash

yarn install

./example yarn install

npm link example/node_modules/react

yarn link

./example yarn link "@stefanoruth/fetch-hooks"
