type Severity = "info" | "log" | "warn" | "error";

const SeveritySymbol = {
  info: "\u001b[34mi\u001b[0m",
  log: "\u001b[32m~\u001b[0m",
  warn: "\u001b[33m!\u001b[0m",
  error: "\u001b[31mx\u001b[0m",
} as const satisfies Record<Severity, string>;

function yellow(text: string) {
  return `\u001b[33m${text}\u001b[0m`;
}

export class Logger {
  constructor(readonly context: string) {}

  private print(severity: Severity, ...args: any[]) {
    if (typeof args[0] !== "string") {
      console[severity](
        `[${SeveritySymbol[severity]}] [${new Date().toISOString()}] (${yellow(this.context)})`,
        args[0],
      );
      return;
    }

    if (args[1] === undefined) {
      console[severity](
        `[${SeveritySymbol[severity]}] [${new Date().toISOString()}] (${yellow(this.context)}) ${args[0]}`,
      );
    } else {
      console[severity](
        `[${SeveritySymbol.log}] [${new Date().toISOString()}] (${yellow(this.context)}) ${args[0]}`,
        args[1],
      );
    }
  }

  public info = (message: string, more?: any) => {
    this.print("info", message, more);
  };

  public log = (message: string, more?: any) => {
    this.print("log", message, more);
  };

  public warn = (message: string, more?: any) => {
    this.print("warn", message, more);
  };

  public error = (err: any) => {
    this.print("error", err);
  };
}
