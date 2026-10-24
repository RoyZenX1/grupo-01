import { describe, expect, it } from 'vitest'; 
import { INITIATIVES } from '../data/initiatives'; 
import { filterInitiatives, toggleFavorite } from './filterInitiatives'; 
 
describe('filterInitiatives', () => { 
  it('returns every initiative with the initial filters', () => { 
    const result = filterInitiatives( 
      INITIATIVES, 
      { query: '', category: 'Todas', onlyFavorites: false }, 
      new Set(), 
    ); 
    expect(result).toHaveLength(6); 
  }); 
 
  it('normalizes spaces and uppercase characters', () => { 
    const result = filterInitiatives(     INITIATIVES, 
      { query: '  REACT ', category: 'Todas', onlyFavorites: false }, 
      new Set(), 
    ); 
    expect(result.map(({ id }) => id)).toEqual([1, 4]); 
  }); 
 
  it('searches title, description, category and skills', () => { 
    const result = filterInitiatives( 
      INITIATIVES, 
      { query: 'teclado', category: 'Todas', onlyFavorites: false }, 
      new Set(), 
    ); 
    expect(result[0]?.title).toBe('Guía de accesibilidad digital'); 
  });
   it('combines category and favorite filters', () => { 
    const result = filterInitiatives( 
      INITIATIVES, 
      { query: '', category: 'Datos', onlyFavorites: true }, 
      new Set([2, 3]), 
    ); 
    expect(result.map(({ id }) => id)).toEqual([2]); 
  }); 
 
  it('does not mutate the source collection', () => { 
    const snapshot = JSON.stringify(INITIATIVES); 
    filterInitiatives( 
      INITIATIVES, 
      { query: 'react', category: 'Todas', onlyFavorites: false }, 
      new Set(), 
    ); 
       expect(JSON.stringify(INITIATIVES)).toBe(snapshot); 
  }); 
}); 
 
describe('toggleFavorite', () => { 
  it('adds an id without mutating the original Set', () => { 
    const original = new Set([1]); 
    const result = toggleFavorite(original, 2); 
    expect([...result]).toEqual([1, 2]); 
    expect([...original]).toEqual([1]); 
  }); 
 
  it('removes an id that is already selected', () => { 
    expect([...toggleFavorite(new Set([1, 2]), 1)]).toEqual([2]); 
  }); 
});