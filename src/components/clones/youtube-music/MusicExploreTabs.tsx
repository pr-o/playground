'use client';

import { useMemo, useState } from 'react';
import { ContentSection } from '@/components/clones/youtube-music/ContentSection';
import { HorizontalScroller } from '@/components/clones/youtube-music/HorizontalScroller';
import {
  MusicArtistCard,
  MusicReleaseCard,
} from '@/components/clones/youtube-music/MusicCards';
import { MusicTrackRow } from '@/components/clones/youtube-music/MusicTrackRow';
import type { MusicExploreSection } from '@/types/music';

type ExploreTab = 'new-releases' | 'charts' | 'moods';

type MusicExploreTabsProps = {
  sections: MusicExploreSection[];
};

const TAB_LABELS: Record<ExploreTab, string> = {
  'new-releases': 'New Releases',
  charts: 'Charts',
  moods: 'Moods & Genres',
};

export function MusicExploreTabs({ sections }: MusicExploreTabsProps) {
  const [activeTab, setActiveTab] = useState<ExploreTab>('new-releases');

  const releaseSections = useMemo(
    () => sections.filter((section) => section.kind === 'new-releases'),
    [sections],
  );
  const chartTrackSections = useMemo(
    () => sections.filter((section) => section.kind === 'chart-tracks'),
    [sections],
  );
  const chartArtistSections = useMemo(
    () => sections.filter((section) => section.kind === 'chart-artists'),
    [sections],
  );
  const categoriesSection = useMemo(
    () => sections.find((section) => section.kind === 'categories'),
    [sections],
  );

  const [heroSection, ...supportingReleaseSections] = releaseSections;

  return (
    <div className="space-y-8">
      <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm">
        {(Object.keys(TAB_LABELS) as ExploreTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 transition ${
              activeTab === tab
                ? 'bg-white/20 text-music-primary'
                : 'text-music-muted hover:bg-white/10'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'new-releases' && (
        <div className="space-y-10">
          {heroSection && heroSection.items.length > 0 && (
            <ContentSection
              title={heroSection.title}
              description="Fresh drops pulled from Discogs genres you follow."
              headingClassName="gap-3"
            >
              <HorizontalScroller>
                {heroSection.items.map((release) => (
                  <MusicReleaseCard
                    key={release.id}
                    release={release}
                    className="w-56 lg:w-64 xl:w-72"
                  />
                ))}
              </HorizontalScroller>
            </ContentSection>
          )}

          {supportingReleaseSections.map((section) => (
            <ContentSection key={section.title} title={section.title}>
              <HorizontalScroller>
                {section.items.map((release) => (
                  <MusicReleaseCard key={release.id} release={release} />
                ))}
              </HorizontalScroller>
            </ContentSection>
          ))}
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="space-y-10">
          {chartTrackSections.map((section) => (
            <ContentSection
              key={section.title}
              title={section.title}
              description={section.region ? `Region: ${section.region}` : undefined}
            >
              <div className="space-y-3">
                {section.items.map((track, index) => (
                  <MusicTrackRow key={track.id} track={track} index={index + 1} />
                ))}
              </div>
            </ContentSection>
          ))}

          {chartArtistSections.map((section) => (
            <ContentSection
              key={section.title}
              title={section.title}
              description={section.region ? `Region: ${section.region}` : undefined}
            >
              <HorizontalScroller>
                {section.items.map((artist) => (
                  <MusicArtistCard key={artist.id} artist={artist} />
                ))}
              </HorizontalScroller>
            </ContentSection>
          ))}
        </div>
      )}

      {activeTab === 'moods' && categoriesSection && (
        <ContentSection
          title={categoriesSection.title}
          description="Jump into curated Discogs crates by mood or genre."
        >
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            {categoriesSection.items.map((category) => (
              <div
                key={category.id}
                className="flex h-36 flex-col justify-between rounded-3xl border border-white/5 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 text-music-primary transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-music-ghost">
                  Genre
                </div>
                <div className="text-2xl font-semibold">{category.name}</div>
                <div className="text-xs text-music-muted">Tap to explore releases</div>
              </div>
            ))}
          </div>
        </ContentSection>
      )}
    </div>
  );
}
