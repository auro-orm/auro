#! /usr/bin/env node

import { CLI } from './CLI';
import { GenerateCommand } from './commands/Generate';

const parser = new CLI();

parser.addCommand('generate', 'Generate something', () => {
  GenerateCommand.configureCommand();
});

parser.execute();
