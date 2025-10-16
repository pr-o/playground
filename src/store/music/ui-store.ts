import { create } from 'zustand';

export type PrimaryMusicRoute = 'home' | 'explore' | 'library' | 'search';
export type LibraryTab = 'playlists' | 'songs' | 'albums' | 'artists';
export type CollectionViewMode = 'grid' | 'list';
export type SidebarDensity = 'expanded' | 'compact' | 'hidden';
export type MusicToastVariant = 'default' | 'info' | 'success' | 'warning' | 'error';

export type MusicToast = {
  id: string;
  title: string;
  description?: string;
  variant?: MusicToastVariant;
  durationMs?: number;
};

export type MusicUIState = {
  sidebarDensity: SidebarDensity;
  activeRoute: PrimaryMusicRoute;
  activeLibraryTab: LibraryTab;
  collectionViewMode: CollectionViewMode;
  isQueueOpen: boolean;
  isSearchFocused: boolean;
  isMobileNavOpen: boolean;
  mobileNowPlayingOpen: boolean;
  highlightedTrackId?: string;
  hoveredTrackId?: string;
  toasts: MusicToast[];
};

export type MusicUIActions = {
  setSidebarDensity: (density: SidebarDensity) => void;
  setActiveRoute: (route: PrimaryMusicRoute) => void;
  setActiveLibraryTab: (tab: LibraryTab) => void;
  setCollectionViewMode: (mode: CollectionViewMode) => void;
  toggleQueue: (value?: boolean) => void;
  setSearchFocused: (value: boolean) => void;
  setMobileNavOpen: (value: boolean) => void;
  setMobileNowPlayingOpen: (value: boolean) => void;
  setHighlightedTrack: (trackId?: string) => void;
  setHoveredTrack: (trackId?: string) => void;
  pushToast: (toast: Omit<MusicToast, 'id'> & { id?: string }) => string;
  dismissToast: (id: string) => void;
  resetUIState: () => void;
};

export type MusicUIStore = MusicUIState & MusicUIActions;

const initialState: MusicUIState = {
  sidebarDensity: 'expanded',
  activeRoute: 'home',
  activeLibraryTab: 'playlists',
  collectionViewMode: 'grid',
  isQueueOpen: false,
  isSearchFocused: false,
  isMobileNavOpen: false,
  mobileNowPlayingOpen: false,
  highlightedTrackId: undefined,
  hoveredTrackId: undefined,
  toasts: [],
};

export const useMusicUIStore = create<MusicUIStore>((set) => ({
  ...initialState,

  setSidebarDensity: (density) => {
    set((state) => ({
      ...state,
      sidebarDensity: density,
    }));
  },

  setActiveRoute: (route) => {
    set((state) => ({
      ...state,
      activeRoute: route,
    }));
  },

  setActiveLibraryTab: (tab) => {
    set((state) => ({
      ...state,
      activeLibraryTab: tab,
    }));
  },

  setCollectionViewMode: (mode) => {
    set((state) => ({
      ...state,
      collectionViewMode: mode,
    }));
  },

  toggleQueue: (value) => {
    set((state) => ({
      ...state,
      isQueueOpen: value ?? !state.isQueueOpen,
    }));
  },

  setSearchFocused: (value) => {
    set((state) => ({
      ...state,
      isSearchFocused: value,
    }));
  },

  setMobileNavOpen: (value) => {
    set((state) => ({
      ...state,
      isMobileNavOpen: value,
    }));
  },

  setMobileNowPlayingOpen: (value) => {
    set((state) => ({
      ...state,
      mobileNowPlayingOpen: value,
    }));
  },

  setHighlightedTrack: (trackId) => {
    set((state) => ({
      ...state,
      highlightedTrackId: trackId,
    }));
  },

  setHoveredTrack: (trackId) => {
    set((state) => ({
      ...state,
      hoveredTrackId: trackId,
    }));
  },

  pushToast: (toast) => {
    const id = toast.id ?? `toast-${Math.random().toString(36).slice(2, 9)}`;
    set((state) => ({
      ...state,
      toasts: [
        ...state.toasts.filter((existing) => existing.id !== id),
        {
          id,
          title: toast.title,
          description: toast.description,
          variant: toast.variant ?? 'default',
          durationMs: toast.durationMs ?? 4000,
        },
      ],
    }));
    return id;
  },

  dismissToast: (id) => {
    set((state) => ({
      ...state,
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  resetUIState: () => {
    set(() => ({
      ...initialState,
    }));
  },
}));
