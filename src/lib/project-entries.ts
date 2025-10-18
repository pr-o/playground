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
};

export const ProjectEntries: ProjectEntry[] = [
  {
    title: 'Netflix Clone',
    href: '/apps/netflix',
    tag: 'netflix',
    kind: ProjectKind.App,
    description:
      'Browse trending films and series powered by the TMDB API, complete with hero banners, carousels, and a personal watch list.',
  },
  {
    title: 'Upbit Dashboard',
    href: '/apps/upbit',
    tag: 'upbit',
    kind: ProjectKind.App,
    description:
      'Real-time order book, chart, and trade insights powered by the Upbit Open API.',
  },
  {
    title: 'YouTube Music Clone',
    href: '/apps/youtube-music',
    tag: 'youtube-music',
    kind: ProjectKind.App,
    description:
      'Responsive recreation of the YouTube Music web app with Spotify-powered data, multi-tab navigation, and a rich playback experience.',
  },
  {
    title: 'Excalidraw Clone',
    href: '/apps/excalidraw',
    tag: 'excalidraw',
    kind: ProjectKind.App,
    description:
      'Infinite canvas whiteboard with Excalidraw-inspired layout, tools, and drawing surface.',
  },
  {
    title: 'Notion Clone',
    href: '/apps/notion',
    tag: 'notion',

    kind: ProjectKind.App,
    description:
      'A local-first documents workspace with block editing, inline formatting, and persistence in the browser.',
  },
  {
    title: '2048 Remix',
    href: '/games/game-2048',
    tag: '2048',
    kind: ProjectKind.Game,
    description:
      'A modern take on 2048 with persistent state, upcoming animations, and achievement tracking.',
  },
];
