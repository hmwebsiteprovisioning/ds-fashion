'use client';

import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <section className="bg-[#faf8f5] border-t border-[#e8e0d5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h3 className="font-serif-display text-xl sm:text-2xl text-[#1a1a1a] mb-1">
              Абонирай се за нашия бюлетин
            </h3>
            <p className="text-[13px] text-[#6b6b6b]">
              Бъди първи, който узнава за нови колекции, специални оферти и събития.
            </p>
          </div>
          {done ? (
            <p className="text-[#c49a3c] font-medium text-[13px]">Благодарим за абонамента! ✓</p>
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
                className="flex-1 lg:w-72 px-4 py-3 border border-[#e8e0d5] bg-white text-[13px] text-[#1a1a1a] placeholder-[#9e9e9e] outline-none focus:border-[#c49a3c]"
              />
              <button
                type="submit"
                className="bg-[#c49a3c] hover:bg-[#a07c28] text-white text-[11px] font-bold tracking-widest px-6 py-3 uppercase transition-colors whitespace-nowrap"
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
