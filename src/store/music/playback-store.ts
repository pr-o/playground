import { create } from 'zustand';
import type { MusicPlaybackTrack } from '@/types/playback';

export type RepeatMode = 'off' | 'context' | 'track';

export type PlaybackState = {
  queue: MusicPlaybackTrack[];
  history: MusicPlaybackTrack[];
  currentIndex: number;
  isPlaying: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  volume: number;
  isMuted: boolean;
  progressMs: number;
  deviceId?: string;
};

export type PlaybackActions = {
  loadQueue: (tracks: MusicPlaybackTrack[], startIndex?: number) => void;
  playTrack: (track: MusicPlaybackTrack, options?: { startPlaying?: boolean }) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  addToQueue: (
    tracks: MusicPlaybackTrack | MusicPlaybackTrack[],
    options?: { next?: boolean },
  ) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setProgress: (progressMs: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setShuffle: (value: boolean) => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
};

export type PlaybackStore = PlaybackState & PlaybackActions;

const initialState: PlaybackState = {
  queue: [],
  history: [],
  currentIndex: -1,
  isPlaying: false,
  shuffle: false,
  repeatMode: 'off',
  volume: 0.75,
  isMuted: false,
  progressMs: 0,
};

function getNextIndex(state: PlaybackState) {
  if (state.queue.length === 0) return -1;
  if (state.shuffle) {
    const remainingIndices = state.queue
      .map((_, index) => index)
      .filter((index) => index !== state.currentIndex);
    if (remainingIndices.length === 0) {
      return state.repeatMode === 'context' ? 0 : state.currentIndex;
    }
    const randomIndex = Math.floor(Math.random() * remainingIndices.length);
    return remainingIndices[randomIndex];
  }

  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.queue.length) {
    return state.repeatMode === 'context' ? 0 : state.currentIndex;
  }
  return nextIndex;
}

function getPreviousIndex(state: PlaybackState) {
  if (state.queue.length === 0) return -1;
  if (state.shuffle) {
    const remainingIndices = state.queue
      .map((_, index) => index)
      .filter((index) => index !== state.currentIndex);
    if (remainingIndices.length === 0) {
      return state.repeatMode === 'context' ? state.queue.length - 1 : state.currentIndex;
    }
    const randomIndex = Math.floor(Math.random() * remainingIndices.length);
    return remainingIndices[randomIndex];
  }

  const previousIndex = state.currentIndex - 1;
  if (previousIndex < 0) {
    return state.repeatMode === 'context' ? state.queue.length - 1 : state.currentIndex;
  }
  return previousIndex;
}

export const useMusicPlaybackStore = create<PlaybackStore>((set, get) => ({
  ...initialState,

  loadQueue: (tracks, startIndex = 0) => {
    if (tracks.length === 0) {
      set(() => ({
        ...initialState,
      }));
      return;
    }
    const index = Math.min(Math.max(startIndex, 0), tracks.length - 1);
    set(() => ({
      ...initialState,
      queue: tracks,
      currentIndex: index,
      isPlaying: true,
    }));
  },

  playTrack: (track, options = {}) => {
    const { queue } = get();
    const existingIndex = queue.findIndex((item) => item.id === track.id);
    if (existingIndex !== -1) {
      set((state) => ({
        ...state,
        currentIndex: existingIndex,
        isPlaying: options.startPlaying ?? true,
        progressMs: 0,
      }));
      return;
    }

    set((state) => ({
      ...state,
      queue: [...state.queue, track],
      currentIndex: state.queue.length,
      isPlaying: options.startPlaying ?? true,
      progressMs: 0,
    }));
  },

  togglePlay: () => {
    set((state) => ({
      ...state,
      isPlaying: !state.isPlaying,
    }));
  },

  pause: () => {
    set((state) => ({
      ...state,
      isPlaying: false,
    }));
  },

  resume: () => {
    const state = get();
    if (state.queue.length === 0) {
      return;
    }
    set(() => ({
      isPlaying: true,
    }));
  },

  next: () => {
    set((state) => {
      if (state.queue.length === 0) return state;
      if (state.repeatMode === 'track') {
        return {
          ...state,
          progressMs: 0,
          isPlaying: true,
        };
      }

      const nextIndex = getNextIndex(state);
      if (nextIndex === state.currentIndex) {
        return {
          ...state,
          isPlaying: state.repeatMode !== 'off',
          progressMs: 0,
        };
      }

      const currentTrack = state.queue[state.currentIndex];
      const updatedHistory =
        currentTrack && state.history[state.history.length - 1]?.id !== currentTrack.id
          ? [...state.history, currentTrack]
          : state.history;

      return {
        ...state,
        currentIndex: nextIndex,
        history: updatedHistory,
        progressMs: 0,
        isPlaying: true,
      };
    });
  },

  previous: () => {
    set((state) => {
      if (state.queue.length === 0) return state;
      if (state.repeatMode === 'track') {
        return {
          ...state,
          progressMs: 0,
          isPlaying: true,
        };
      }

      const previousIndex = getPreviousIndex(state);
      if (previousIndex === state.currentIndex) {
        const rewindedHistory = [...state.history];
        if (rewindedHistory.length) rewindedHistory.pop();
        return {
          ...state,
          history: rewindedHistory,
          progressMs: 0,
          isPlaying: state.repeatMode !== 'off',
        };
      }

      const rewindedHistory = [...state.history];
      if (rewindedHistory.length) rewindedHistory.pop();

      return {
        ...state,
        currentIndex: previousIndex,
        history: rewindedHistory,
        progressMs: 0,
        isPlaying: true,
      };
    });
  },

  addToQueue: (tracks, options) => {
    const newTracks = Array.isArray(tracks) ? tracks : [tracks];
    set((state) => {
      if (state.queue.length === 0) {
        return {
          ...state,
          queue: newTracks,
          currentIndex: 0,
          isPlaying: options?.next ? false : state.isPlaying,
        };
      }

      if (options?.next) {
        const queueClone = [...state.queue];
        const insertIndex = Math.min(state.currentIndex + 1, queueClone.length);
        queueClone.splice(insertIndex, 0, ...newTracks);
        return {
          ...state,
          queue: queueClone,
        };
      }

      return {
        ...state,
        queue: [...state.queue, ...newTracks],
      };
    });
  },

  removeFromQueue: (trackId) => {
    set((state) => {
      const index = state.queue.findIndex((track) => track.id === trackId);
      if (index === -1) return state;
      const updatedQueue = state.queue.filter((track) => track.id !== trackId);
      let nextIndex = state.currentIndex;
      if (index < state.currentIndex) {
        nextIndex = Math.max(nextIndex - 1, 0);
      } else if (index === state.currentIndex) {
        nextIndex = Math.min(nextIndex, updatedQueue.length - 1);
      }
      return {
        ...state,
        queue: updatedQueue,
        currentIndex: updatedQueue.length ? nextIndex : -1,
        isPlaying: updatedQueue.length ? state.isPlaying : false,
      };
    });
  },

  clearQueue: () => {
    set(() => ({
      ...initialState,
    }));
  },

  setProgress: (progressMs) => {
    set((state) => ({
      ...state,
      progressMs,
    }));
  },

  setVolume: (volume) => {
    set((state) => ({
      ...state,
      volume: Math.min(Math.max(volume, 0), 1),
    }));
  },

  toggleMute: () => {
    set((state) => ({
      ...state,
      isMuted: !state.isMuted,
    }));
  },

  setRepeatMode: (mode) => {
    set((state) => ({
      ...state,
      repeatMode: mode,
    }));
  },

  setShuffle: (value) => {
    set((state) => ({
      ...state,
      shuffle: value,
    }));
  },

  moveQueueItem: (fromIndex, toIndex) => {
    set((state) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.queue.length ||
        toIndex >= state.queue.length ||
        fromIndex === toIndex
      ) {
        return state;
      }

      const updatedQueue = [...state.queue];
      const [moved] = updatedQueue.splice(fromIndex, 1);
      updatedQueue.splice(toIndex, 0, moved);

      let currentIndex = state.currentIndex;

      if (fromIndex === state.currentIndex) {
        currentIndex = toIndex;
      } else {
        if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
          currentIndex -= 1;
        } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
          currentIndex += 1;
        }
      }

      currentIndex = Math.max(0, Math.min(currentIndex, updatedQueue.length - 1));

      return {
        ...state,
        queue: updatedQueue,
        currentIndex,
      };
    });
  },
}));
