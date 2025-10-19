import type { Board } from './board';
import type { Field } from './field';
import type { Tile } from './tile';
import { BEJEWELED_CONFIG } from './config';

export type MatchCluster = {
  tiles: Tile[];
  origins: Field[];
  directions: Array<'row' | 'col'>;
};

type RawCluster = {
  tiles: Tile[];
  origin: Field;
  direction: 'row' | 'col';
};

export class CombinationManager {
  private readonly board: Board;

  constructor(board: Board) {
    this.board = board;
  }

  // Returns all horizontal and vertical match clusters on the board.
  findMatches(): MatchCluster[] {
    const matches: RawCluster[] = [];
    const visited = new Set<Tile>();

    for (const rowFields of this.board.fields) {
      for (const field of rowFields) {
        const tile = field.tile;
        if (!tile || visited.has(tile)) {
          continue;
        }

        const horizontal = this.collectLineMatch(field, tile, 'row');
        const vertical = this.collectLineMatch(field, tile, 'col');

        if (horizontal) {
          horizontal.tiles.forEach((matchedTile) => visited.add(matchedTile));
          matches.push(horizontal);
        }
        if (vertical) {
          vertical.tiles.forEach((matchedTile) => visited.add(matchedTile));
          matches.push(vertical);
        }
      }
    }

    const merged = this.mergeClusters(matches);
    this.board.setDebugMatches(merged);
    return merged;
  }

  private collectLineMatch(
    origin: Field,
    tile: Tile,
    axis: 'row' | 'col',
  ): RawCluster | null {
    const matchedTiles: Tile[] = [tile];
    const id = tile.id;

    const step =
      axis === 'row'
        ? { forward: { row: 0, col: 1 }, backward: { row: 0, col: -1 } }
        : { forward: { row: 1, col: 0 }, backward: { row: -1, col: 0 } };

    const explore = (dir: { row: number; col: number }, pushFront: boolean) => {
      let row = origin.row + dir.row;
      let col = origin.col + dir.col;

      while (true) {
        const neighbor = this.board.getField(row, col);
        if (!neighbor || !neighbor.tile || neighbor.tile.id !== id) {
          break;
        }
        if (pushFront) {
          matchedTiles.unshift(neighbor.tile);
        } else {
          matchedTiles.push(neighbor.tile);
        }
        row += dir.row;
        col += dir.col;
      }
    };

    explore(step.backward, true);
    explore(step.forward, false);

    if (matchedTiles.length < BEJEWELED_CONFIG.minimumMatch) {
      return null;
    }

    return {
      tiles: matchedTiles,
      origin,
      direction: axis,
    };
  }

  // Merges clusters that share tiles so each tile is processed exactly once.
  private mergeClusters(clusters: RawCluster[]): MatchCluster[] {
    const groups: Array<{
      tiles: Set<Tile>;
      origins: Set<Field>;
      directions: Set<'row' | 'col'>;
    }> = [];

    for (const cluster of clusters) {
      const intersecting = groups.filter((group) =>
        cluster.tiles.some((tile) => group.tiles.has(tile)),
      );

      const target =
        intersecting.shift() ??
        (() => {
          const fresh = {
            tiles: new Set<Tile>(),
            origins: new Set<Field>(),
            directions: new Set<'row' | 'col'>(),
          };
          groups.push(fresh);
          return fresh;
        })();

      cluster.tiles.forEach((tile) => target.tiles.add(tile));
      target.origins.add(cluster.origin);
      target.directions.add(cluster.direction);

      for (const group of intersecting) {
        group.tiles.forEach((tile) => target.tiles.add(tile));
        group.origins.forEach((origin) => target.origins.add(origin));
        group.directions.forEach((dir) => target.directions.add(dir));
        const index = groups.indexOf(group);
        if (index >= 0) {
          groups.splice(index, 1);
        }
      }
    }

    return groups.map((group) => ({
      tiles: Array.from(group.tiles),
      origins: Array.from(group.origins),
      directions: Array.from(group.directions),
    }));
  }
}
