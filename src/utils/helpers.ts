/* eslint-disable @typescript-eslint/no-inferrable-types */
import { EditorPosition } from "obsidian";
import { colorKeyWords } from "./colorKeyWords";

export function findSequenceFromCursor(line : string , regex : RegExp , cursor: EditorPosition , step : number) : RegExpMatchArray | null {
    let findRegex: boolean = false;
    let stop : number = -1;
    let searchOffset : number = cursor.ch;
    while (!findRegex && stop < 1000){
        stop++;
        const substrLine = line.substring(searchOffset , cursor.ch);
        const match = regex.test(substrLine);
        if (match){
            findRegex = true;
            return regex.exec(substrLine);
        }
        if (searchOffset - step < 0 && searchOffset !== 0) searchOffset = 0;
        else searchOffset = searchOffset - step;
        if (searchOffset < 0){
            break;
        } 
    }
    return null;
}

export function getWorldFromFont(font : string){
    const wordRegex : RegExp = new RegExp('>[a-zA-Z]+<')
    return font.match(wordRegex);
}

export function verifyColor(color: string): string | undefined {
    if (colorKeyWords.includes(color)) return color;
    let regex = new RegExp('^#[a-f0-9]{6}');
    if (regex.test(color)) 
        return color;
    else{
        regex = new RegExp('/^[a-f0-9]{3}');
        if (regex.test(color))
            return "#"+color;
    }
}
