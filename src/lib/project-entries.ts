export enum ProjectKind {
  App = 'App',
  Game = 'Game',
}

export type ProjectEntry = {
  title: string;
  href: string;
  tag: string;
  kind: ProjectKind;
  description: string;
  thumbnail: string;
  thumbnailAlt: string;
  techStack: string[];
};

export const ProjectEntries: ProjectEntry[] = [
  {
    title: 'Netflix',
    href: '/apps/netflix',
    tag: 'clone',
    kind: ProjectKind.App,
    description:
      'Rebuild of the Netflix browsing experience with dynamic carousels, watch lists, and hero spotlights fed by live TMDB data.',
    thumbnail: '/assets/apps/netflix-logo.svg',
    thumbnailAlt: 'Preview of the Netflix clone.',
    techStack: ['TMDB Open API'],
  },
  {
    title: 'Upbit Dashboard',
    href: '/apps/upbit',
    tag: 'clone',
    kind: ProjectKind.App,
    description:
      'Live market dashboard for Upbit showing streaming order book depth, price movement charts, and market snapshots.',
    thumbnail: '/assets/apps/upbit-logo.svg',
    thumbnailAlt: 'Preview of the Upbit dashboard clone.',
    techStack: ['React Query', 'Upbit Open API', 'WebSocket'],
  },
  {
    title: 'YouTube',
    href: '/apps/youtube',
    tag: 'clone',
    kind: ProjectKind.App,
    description: 'Responsive recreation of the YouTube web app.',
    thumbnail: '/assets/apps/youtube-logo.svg',
    thumbnailAlt: 'Preview of the YouTube clone.',
    techStack: ['React Query', 'Drizzle', 'tRPC'],
  },
  {
    title: 'YouTube Music',
    href: '/apps/youtube-music',
    tag: 'clone',
    kind: ProjectKind.App,
    description:
      'Responsive recreation of the YouTube Music web app with Discogs API data, multi-tab navigation.',
    thumbnail: '/assets/apps/youtube-music-logo.svg',
    thumbnailAlt: 'Preview of the YouTube Music clone.',
    techStack: ['React Query', 'Discogs Open API'],
  },
  {
    title: 'Excalidraw',
    href: '/apps/excalidraw',
    tag: 'clone',
    kind: ProjectKind.App,
    description:
      'Infinite canvas whiteboard with Excalidraw-inspired layout, tools, and drawing surface.',
    thumbnail: '/assets/apps/excalidraw-logo.svg',
    thumbnailAlt: 'Preview of the Excalidraw clone.',
    techStack: ['Konva', 'Zustand', 'Immer'],
  },
  {
    title: 'Notion',
    href: '/apps/notion',
    tag: 'clone',
    kind: ProjectKind.App,
    description:
      'A local-first documents workspace with block editing, inline formatting, and persistence in the browser.',
    thumbnail: '/assets/apps/notion-logo.svg',
    thumbnailAlt: 'Preview of the Notion clone.',
    techStack: ['Discogs API', 'Blocks Editor', 'IndexedDB'],
  },
  {
    title: '2048 Remix',
    href: '/games/game-2048',
    tag: 'clone',
    kind: ProjectKind.Game,
    description:
      'A modern take on 2048 with persistent state, upcoming animations, and achievement tracking.',
    thumbnail: '/assets/games/2048-logo.svg',
    thumbnailAlt: 'Preview of the 2048 game clone.',
    techStack: ['Zustand', 'Motion'],
  },
  {
    title: 'Bejeweled',
    href: '/games/bejeweled',
    tag: 'clone',
    kind: ProjectKind.Game,
    description: 'A modern take on Bejeweled in a PixiJS-powered renderer.',
    thumbnail: '/assets/games/bejeweled-logo.svg',
    thumbnailAlt: 'Preview of the Bejeweled clone.',
    techStack: ['PixiJS'],
  },
  {
    title: 'Slither Arcade',
    href: '/games/slither',
    tag: 'Slither',
    kind: ProjectKind.Game,
    description: 'Single-player Slither-inspired arena built in PixiJS.',
    thumbnail: '/assets/games/slither-logo.svg',
    thumbnailAlt: 'Preview of the Slither Arcade prototype.',
    techStack: ['PixiJS', 'TypeScript'],
  },
  {
    title: 'Tetris Classic',
    href: '/games/tetris',
    tag: 'tetris',
    kind: ProjectKind.Game,
    description:
      'A minimalist Tetris experience with responsive controls and Framer Motion-enhanced animations.',
    thumbnail: '/assets/games/tetris/tetris-logo.svg',
    thumbnailAlt: 'Preview of the Tetris Classic experience.',
    techStack: ['React', 'TypeScript', 'Motion'],
  },
  {
    title: 'Mini Sudoku',
    href: '/games/sudoku',
    tag: 'puzzle',
    kind: ProjectKind.Game,
    description: 'A modern Mini Sudoku built for touch and responsive design.',
    thumbnail: '/assets/games/sudoku-logo.svg',
    thumbnailAlt: 'Preview of the Mini Sudoku experience.',
    techStack: ['React', 'TypeScript', 'Motion'],
  },
];
