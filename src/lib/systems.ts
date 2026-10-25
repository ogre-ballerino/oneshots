// Game systems the one-shots can be played with. The key is what content
// frontmatter uses in `sistema`; adding a system is one entry here.
export const systems = {
  dnd5e: { label: 'D&D 5e' },
} as const;

export type SystemId = keyof typeof systems;

export const systemIds = Object.keys(systems) as [SystemId, ...SystemId[]];

export const systemLabel = (id: SystemId) => systems[id].label;
