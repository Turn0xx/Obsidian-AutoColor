import { colorKeyWords } from "src/utils/colorKeyWords";

export class Color {

  private constructor(private _color: string) {}

  public static from(color: string): Color {
    
    if (!this.isColor(color)) {
      throw new Error(`Color ${color} is not a valid color.`);
    }

    return new Color(color);
  }

  public unpack(): string {
    return this._color;
  }

  public equals(other: Color): boolean {
    return this._color === other.unpack();
  }

  public static isColor(color: string): boolean {
    if (colorKeyWords.includes(color)) return true;
    let regex = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
    if (regex.test(color)) return true;

    return false;
  }

  public toString(): string {
    return this._color;
  }


}