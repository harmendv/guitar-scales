type Option = { label: string; value: string };

const families: { label: string; slugs: string[] }[] = [
    { label: "Diatonic", slugs: ["major", "natural-minor"] },
    { label: "Pentatonic", slugs: ["major-pentatonic", "minor-pentatonic"] },
    { label: "Harmonic & melodic", slugs: ["melodic-minor", "harmonic-minor", "harmonic-major"] },
    { label: "Symmetric", slugs: ["diminished", "augmented", "whole-tone"] },
];

// Anything not in a family above lands in "Exotic", so new scales still show up
export function groupScales(options: Option[]) {
    const grouped = new Set(families.flatMap((family) => family.slugs));
    return [
        ...families.map((family) => ({
            label: family.label,
            options: family.slugs
                .map((slug) => options.find((option) => option.value === slug))
                .filter((option) => option != null),
        })),
        {
            label: "Exotic",
            options: options.filter((option) => !grouped.has(option.value)),
        },
    ].filter((group) => group.options.length > 0);
}

// "Aeolian / Natural Minor" → name "Aeolian", alias "Natural Minor"
export function splitModeLabel(label: string) {
    const [name, ...aliases] = label.split(" / ");
    return { name, alias: aliases.join(" / ") };
}
