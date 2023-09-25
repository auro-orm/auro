import { CLI } from '../src/CLI';

describe('CLI', () => {
  let cli: CLI;

  beforeEach(() => {
    cli = new CLI();
  });

  it('should construct a CLI instance', () => {
    expect(cli).toBeInstanceOf(CLI);
  });

  it('should add a command', () => {
    const commandName = 'generate';
    const description = 'Generate something';
    const action = jest.fn();

    cli.addCommand(commandName, description, action);

    const command = cli.program.commands.find((cmd) => cmd.name() === commandName);
    expect(command).toBeDefined();
    expect(command!.description()).toBe(description);
  });

  it('should execute the program', () => {
    const originalArgv = process.argv;
    process.argv = ['node', 'auro', 'generate'];

    const generateActionFn = jest.fn();

    cli.addCommand('generate', 'Generate something', generateActionFn);

    cli.execute();

    expect(generateActionFn).toHaveBeenCalled();

    process.argv = originalArgv;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
