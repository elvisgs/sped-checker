#!/usr/bin/env node

'use strict';

const spedFile = process.argv[2];

if (!spedFile) {
  console.log('Uso: sped-checker <caminho_arquivo_sped>');
  process.exit(1);
}

const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream(spedFile)
});

let lineNumber = 0;
let fieldCounts;
let hasErrors = false;

lineReader.on('line', line => {
  lineNumber++;

  line = line.replace(/^\|/, '').replace(/\|$/, '');
  const values = line.split('|');

  if (lineNumber === 1) {
    const layout = /^\d{8}$/.test(values[3]) ? 'fiscal' : 'contrib';
    const version = values[1];
    fieldCounts = require(`./${layout}-${version}`);
  }

  const reg = values[0];

  if (!fieldCounts[reg]) {
    console.log(`Linha ${lineNumber}: bloco ${reg[0]} ou registro ${reg} nao suportado`);
    hasErrors = true;
    return;
  }

  const expected = fieldCounts[reg];
  const found = values.length;

  if (found !== expected) {
    console.log(`Linha ${lineNumber}: esperado(s) ${expected}, encontrado(s) ${found} campo(s)`);
    hasErrors = true;
  }
});

lineReader.on('close', () => {
  if (!hasErrors) {
    console.log('Nao foram encontrados erros');
  }

  console.log(`\n${lineNumber} linhas lidas`);
});
