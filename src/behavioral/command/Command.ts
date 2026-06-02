export interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
  describe(): {
    action: string;
    targetId: string;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  };
}

export class CommandHistory {
  private history: Command[] = [];

  async execute(command: Command): Promise<void> {
    await command.execute();
    this.history.push(command);
  }

  async undo(): Promise<void> {
    const cmd = this.history.pop();
    if (cmd) {
      await cmd.undo();
    }
  }

  getHistory(): Command[] {
    return [...this.history];
  }

  clear(): void {
    this.history = [];
  }
}
