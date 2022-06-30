#!/bin/bash
rm dist/* || true
npm i @vercel/ncc
mkdir -p dist
node_modules/.bin/ncc build index.js