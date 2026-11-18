import type { Metadata } from 'next';
import { CORRECTIONS_URL } from '../../lib/site';
import { loadSeed } from '../../lib/data';

export const metadata: Metadata = { title: 'About · Nextwatch' };

export default async function AboutPage() {
  const seed = await loadSeed();
  return (
    <main className="prose">
      <h1>About Nextwatch</h1>
      <p>Nextwatch shows when the anime you are waiting for comes out, in your own timezone, and only says what a source supports.</p>

      <h2 id="method">How dates work</h2>
      <ul>
        <li>Exact times are stored in UTC and shown in your timezone, so the Radar groups releases by <em>your</em> calendar day.</li>
        <li>Dates are only as precise as the source: “Fall 2027”, “2027” or “Release date TBA” never become a made-up day or a countdown.</li>
        <li>A countdown appears only for a confirmed exact time.</li>
        <li>A Japanese TV broadcast, a streaming release in one country and a cinema opening are separate events. A broadcast airing does not mean the episode can be streamed where you are.</li>
        <li>When a date changes, the old date is kept and shown with the source that changed it.</li>
      </ul>

      <h2 id="data">Where the data comes from</h2>
      {seed.fictional ? (
        <p>Everything on this site is currently <strong>fictional sample data</strong> used to build and test it. No real titles, dates, platforms or sources are shown yet.</p>
      ) : (
        <>
          <p>Release dates come from <a href="https://www.themoviedb.org" rel="noopener noreferrer">TMDB</a> (The Movie Database), a community-built film and TV database, and are refreshed every few hours. TMDB lists TV episodes by the date they air in Japan, without a time, so those show as “time not announced”.</p>
          <p>Each release lists its source and when it was last checked. Sources marked “unverified” are not official announcements.</p>
          <p className="meta">This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.</p>
        </>
      )}

      <h2 id="privacy">Privacy</h2>
      <ul>
        <li>There are no accounts, cookies, ads or analytics.</li>
        <li>Your followed list and public title labels are stored only in this browser (local storage). The followed list is not sent to a server. Opening a title requests its public details; clearing this site’s data removes your follows.</li>
        <li>Searches are part of the page address and are not stored by Nextwatch.</li>
      </ul>

      <h2 id="corrections">Report a correction</h2>
      <p>Spotted a wrong date, time or source? <a href={CORRECTIONS_URL} rel="noopener noreferrer">Report it here</a>, with a link to the source if you have one.</p>
    </main>
  );
}
