export interface CommandHandler { 
  executeColorChange(color: string): void;
  executeUnColor(): void;
}