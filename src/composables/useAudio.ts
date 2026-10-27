import { getPitchClass } from "@/composables/useNotes";

// Plucked strings are synthesized with Karplus-Strong, so there's nothing to download.
const DURATION = 2.5;
const FADE_OUT = 0.3;
const STRUM_DELAY = 0.035;

const bufferCache = new Map<number, AudioBuffer>();
let audioContext: AudioContext | null = null;
let output: AudioNode | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined" || typeof window.AudioContext === "undefined") {
        return null;
    }

    if (!audioContext) {
        audioContext = new window.AudioContext();
        // Chords stack several strings, so keep the sum from clipping.
        const compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.value = -12;
        compressor.connect(audioContext.destination);
        output = compressor;
    }
    return audioContext;
}

async function readyContext(): Promise<AudioContext | null> {
    const context = getAudioContext();
    if (context?.state === "suspended") {
        await context.resume().catch(() => {
            // Ignore autoplay restrictions or resume failures.
        });
    }
    return context;
}

function toMidi(note: string, octave: number): number | null {
    const pitchClass = getPitchClass(note);
    return pitchClass == null ? null : (octave + 1) * 12 + pitchClass;
}

function pluck(context: AudioContext, midi: number): AudioBuffer {
    const cached = bufferCache.get(midi);
    if (cached) return cached;

    const sampleRate = context.sampleRate;
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    const length = Math.floor(sampleRate * DURATION);
    const buffer = context.createBuffer(1, length, sampleRate);
    const samples = buffer.getChannelData(0);

    // The averaging filter adds half a sample of delay; an allpass tunes the fractional rest.
    const delay = sampleRate / frequency - 0.5;
    const size = Math.max(Math.floor(delay), 2);
    const fraction = delay - size;
    const allpass = (1 - fraction) / (1 + fraction);
    // Low strings ring longer than high ones.
    const ringTime = Math.min(4, 3 * (110 / frequency) ** 0.3);
    const damping = 0.001 ** (1 / (frequency * ringTime));

    // A softened noise burst is the pick hitting the string.
    const line = new Float32Array(size);
    let smoothed = 0;
    let mean = 0;
    for (let index = 0; index < size; index++) {
        smoothed += 0.5 * (Math.random() * 2 - 1 - smoothed);
        line[index] = smoothed;
        mean += smoothed / size;
    }
    for (let index = 0; index < size; index++) line[index] -= mean;

    let position = 0;
    let previous = 0;
    let allpassIn = 0;
    let allpassOut = 0;
    const fadeStart = length - Math.floor(sampleRate * FADE_OUT);
    for (let index = 0; index < length; index++) {
        const current = line[position];
        const averaged = damping * 0.5 * (current + previous);
        allpassOut = allpass * averaged + allpassIn - allpass * allpassOut;
        allpassIn = averaged;
        line[position] = allpassOut;
        previous = current;
        position = (position + 1) % size;

        const fade = index < fadeStart ? 1 : (length - index) / (length - fadeStart);
        samples[index] = current * fade;
    }

    bufferCache.set(midi, buffer);
    return buffer;
}

function playMidi(context: AudioContext, midi: number, when = context.currentTime): AudioBufferSourceNode {
    const source = context.createBufferSource();
    const gain = context.createGain();

    source.buffer = pluck(context, midi);
    gain.gain.value = 0.6;

    source.connect(gain);
    gain.connect(output ?? context.destination);
    source.start(when);
    return source;
}

export async function playTone(note: string, octave: number): Promise<void> {
    const midi = toMidi(note, octave);
    const context = await readyContext();
    if (!context || midi == null) return;
    playMidi(context, midi);
}

// Strums the chord upwards from the root in octave 3, each tone above the one before.
export async function playChord(notes: string[]): Promise<void> {
    const context = await readyContext();
    if (!context) return;

    let previous: number | null = null;
    notes.forEach((note, index) => {
        const pitchClass = getPitchClass(note);
        if (pitchClass == null) return;
        let midi = 48 + pitchClass;
        if (previous != null) {
            while (midi <= previous) midi += 12;
        }
        previous = midi;
        playMidi(context, midi, context.currentTime + index * STRUM_DELAY);
    });
}

// Notes of the running sequence that haven't sounded yet, so a new one can cancel them.
let pendingSequence: { source: AudioBufferSourceNode; when: number }[] = [];

// Plays notes one after another on the audio clock. Timers would each wait for the context to
// wake up on the first play and then fire together; this waits once and schedules every note.
export async function playSequence(
    steps: { note: string; octave: number }[],
    interval: number
): Promise<void> {
    const context = await readyContext();
    if (!context) return;

    pendingSequence.forEach(({ source, when }) => {
        if (when > context.currentTime) source.stop();
    });

    const midis = steps.map((step) => toMidi(step.note, step.octave));
    // Synthesize every string up front so building one doesn't delay the next.
    midis.forEach((midi) => midi != null && pluck(context, midi));

    // A short lead keeps the first note from starting late on a busy main thread.
    const start = context.currentTime + 0.05;
    pendingSequence = midis.flatMap((midi, index) => {
        if (midi == null) return [];
        const when = start + index * interval;
        return [{ source: playMidi(context, midi, when), when }];
    });
}
