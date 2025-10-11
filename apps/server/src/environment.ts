import { config } from "dotenv";

config();

export class Environment {
  static get(key: string) {
    const value = process.env[key];

    if (value === undefined) {
      throw new Error(`Environment variable '${key}' is missing`);
    }

    return value;
  }
}
