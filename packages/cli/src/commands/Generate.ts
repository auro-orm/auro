import chalk from 'chalk';
import { introspect } from '@auro-orm/core';

export class GenerateCommand {
  static execute() {
    console.log(chalk.yellow('🚀 Starting generation...'));

    introspect()
      .then(() => {
        console.log(chalk.green('🚀 Generation completed successfully.'));
        console.log(chalk.blue('🚀 AuroClient generated.'));
        console.log(
          chalk.yellow('You can now start using AuroClient in your code. Reference:'),
          chalk.blue('https://github.com/auro-orm/auro'),
        );
      })
      .catch((error) => {
        console.error(chalk.red('Generation failed:'));
        console.error(chalk.red(error));
      });
  }

  static configureCommand() {
    this.execute();
  }
}
