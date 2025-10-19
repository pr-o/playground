import type { Board } from './board';
import type { Field } from './field';
import type { Tile } from './tile';
import { BEJEWELED_CONFIG, type BejeweledRuleOffset } from './config';

export type MatchCluster = {
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
    const matches: MatchCluster[] = [];
    const visited = new Set<Tile>();

    for (const rowFields of this.board.fields) {
      for (const field of rowFields) {
        const tile = field.tile;
        if (!tile || visited.has(tile)) {
          continue;
        }

        const horizontal = this.collectMatch(
          field,
          tile,
          BEJEWELED_CONFIG.combinationRules[0],
          'row',
        );
        const vertical = this.collectMatch(
          field,
          tile,
          BEJEWELED_CONFIG.combinationRules[1],
          'col',
        );

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

    return matches;
  }

  // Collects matching tiles in the given direction if they share the same id.
  private collectMatch(
    origin: Field,
    tile: Tile,
    offsets: readonly BejeweledRuleOffset[],
    direction: MatchCluster['direction'],
  ): MatchCluster | null {
    const matchedTiles: Tile[] = [tile];

    for (const offset of offsets) {
      const neighborField = this.board.getField(
        origin.row + offset.row,
        origin.col + offset.col,
      );
      if (!neighborField || !neighborField.tile || neighborField.tile.id !== tile.id) {
        return null;
      }
      matchedTiles.push(neighborField.tile);
    }

    if (matchedTiles.length < BEJEWELED_CONFIG.minimumMatch) {
      return null;
    }

    return {
      tiles: matchedTiles,
      origin,
      direction,
    };
  }
}
