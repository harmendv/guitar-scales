function normalizeSampleNoteName(note: string): string {
    return note
        .replaceAll("♯", "#")
        .replaceAll("♭", "b")
        .replace("A#", "Bb")
        .replace("C#", "Db")
        .replace("D#", "Eb")
        .replace("F#", "Gb")
        .replace("G#", "Ab");
}

export function playTone(note: string, octave: number): void {
    const fileName = `${normalizeSampleNoteName(note)}${octave}.mp3`;
    const audio = new window.Audio(`sounds/${fileName}`);
    audio.volume = 1;
    audio.play().catch(() => {
        // Ignore playback failures such as missing samples or autoplay restrictions.
    });
}
