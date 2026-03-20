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

const bufferCache = new Map<string, Promise<AudioBuffer>>();
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined" || typeof window.AudioContext === "undefined") {
        return null;
    }

    audioContext ??= new window.AudioContext();
    return audioContext;
}

async function loadBuffer(fileName: string): Promise<AudioBuffer | null> {
    const context = getAudioContext();
    if (!context) return null;

    let pendingBuffer = bufferCache.get(fileName);
    if (!pendingBuffer) {
        pendingBuffer = fetch(`sounds/${fileName}`)
            .then((response) => {
                if (!response.ok) throw new Error(`Failed to load audio sample: ${fileName}`);
                return response.arrayBuffer();
            })
            .then((data) => context.decodeAudioData(data));
        bufferCache.set(fileName, pendingBuffer);
    }

    try {
        return await pendingBuffer;
    } catch {
        bufferCache.delete(fileName);
        return null;
    }
}

export async function playTone(note: string, octave: number): Promise<void> {
    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
        await context.resume().catch(() => {
            // Ignore autoplay restrictions or resume failures.
        });
    }

    const fileName = `${normalizeSampleNoteName(note)}${octave}.mp3`;
    const buffer = await loadBuffer(fileName);
    if (!buffer) return;

    const source = context.createBufferSource();
    const gain = context.createGain();

    source.buffer = buffer;
    gain.gain.value = 1;

    source.connect(gain);
    gain.connect(context.destination);
    source.start();
}
