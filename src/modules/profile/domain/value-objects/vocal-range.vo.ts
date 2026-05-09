const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export class VocalRange {
  readonly minMidi: number;
  readonly maxMidi: number;
  readonly spanSemitones: number;
  readonly minNote: string;
  readonly maxNote: string;

  constructor(minMidi: number, maxMidi: number, spanSemitones: number) {
    this.minMidi = minMidi;
    this.maxMidi = maxMidi;
    this.spanSemitones = spanSemitones;
    this.minNote = VocalRange.midiToNoteName(minMidi);
    this.maxNote = VocalRange.midiToNoteName(maxMidi);
  }

  static midiToNoteName(midi: number): string {
    const rounded = Math.round(midi);
    const note = NOTE_NAMES[((rounded % 12) + 12) % 12];
    const octave = Math.floor(rounded / 12) - 1;
    return `${note}${octave}`;
  }
}
