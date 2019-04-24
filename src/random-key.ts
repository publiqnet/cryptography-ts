export class RandomKey {
  private static randomKey: number;

  public static setKey(key: number) {
    this.randomKey = key;
  }

  public static getKey(): number {
    return this.randomKey;
  }
}

