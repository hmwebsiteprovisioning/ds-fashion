'use client';

import Link from 'next/link';

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
      <h2 className="font-serif-display text-2xl sm:text-3xl text-center text-[#1a1a1a] mb-7">
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
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <p className="text-white font-bold tracking-widest text-sm sm:text-base">{tile.label}</p>
              <p className="text-white/70 text-[11px] sm:text-xs mt-0.5">{tile.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
