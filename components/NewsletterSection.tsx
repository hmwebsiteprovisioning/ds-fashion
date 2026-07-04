'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <section className="bg-ds-info border-t border-ds-border">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mail size={18} className="text-ds-gold" />
              <h3 className="font-serif-display text-xl sm:text-2xl text-ds-text">
                Абонирай се за нашия бюлетин
              </h3>
            </div>
            <p className="text-[13px] text-ds-text-secondary">
              Бъди първи, който узнава за нови колекции, специални оферти и събития.
            </p>
          </div>
          {done ? (
            <p className="text-ds-gold font-medium text-[13px]">Благодарим за абонамента! ✓</p>
          ) : (
            <form
              onSubmit={e => { e.preventDefault(); setDone(true); }}
              className="flex w-full lg:w-auto gap-0"
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Въведи имейл адрес"
                required
                className="flex-1 lg:w-72 px-4 py-3 border border-ds-border bg-ds-card text-[13px] text-ds-text placeholder-ds-text-muted outline-none focus:border-ds-gold"
              />
              <button
                type="submit"
                className="bg-ds-gold hover:bg-ds-gold-dark text-white text-[11px] font-bold tracking-widest px-6 py-3 uppercase transition-colors whitespace-nowrap"
              >
                АБОНИРАЙ СЕ
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
