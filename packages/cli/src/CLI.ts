import { Command } from 'commander';

export class CLI {
  public program: Command;

  constructor() {
    this.program = new Command();

    this.program
      .name('auro')
      .description('Auro CLI tool for generating and managing Auro ORM functionalities.')
      .usage('generate [options]')
      .option('--help, -h', 'Show help')
      .option('--version, -v', 'Show version');
  }

  addCommand(commandName: string, description: string, action: () => void) {
    this.program.command(commandName).description(description).action(action);
  }

  execute() {
    this.program.parse(process.argv);

    this.program.option('--help, -h', 'Show help').action(() => {
      this.program.outputHelp();
    });

    this.program.option('--version, -v', 'Show version').action(() => {
      console.log('Version: v0.1.0');
    });
  }
}
