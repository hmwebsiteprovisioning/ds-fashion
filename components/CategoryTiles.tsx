'use client';

import Link from 'next/link';
import { DS } from '@/lib/design-tokens';

const TILES = [
  {
    id: 'women', label: 'ЖЕНИ', sub: 'Разгледай',
    path: '/for-her',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=700&q=85',
  },
  {
    id: 'men', label: 'МЪЖЕ', sub: 'Разгледай',
    path: '/for-him',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=700&q=85',
  },
  {
    id: 'accessories', label: 'АКСЕСОАРИ', sub: 'Разгледай',
    path: '/accessories',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=700&q=85',
  },
  {
    id: 'sale', label: 'SALE', sub: 'Разгледай',
    path: '/products',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=85',
  },
];

export default function CategoryTiles() {
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="font-serif-display text-2xl sm:text-3xl text-center text-ds-text mb-7">
        Пазарувай по категория
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {TILES.map(tile => (
          <Link key={tile.id} href={tile.path} className="group relative overflow-hidden aspect-[3/4] block">
            <img
              src={tile.image}
              alt={tile.label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 transition-colors group-hover:bg-black/35"
              style={{ backgroundColor: DS.overlay }}
            />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <p className="text-white font-bold tracking-widest text-sm sm:text-base">{tile.label}</p>
              <span
                className="inline-block mt-2 text-white text-[11px] sm:text-xs px-3 py-1 border transition-colors group-hover:bg-ds-gold group-hover:border-ds-gold"
                style={{
                  borderColor: DS.categoryBtnBorder,
                  backgroundColor: DS.categoryBtnBg,
                }}
              >
                {tile.sub}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
