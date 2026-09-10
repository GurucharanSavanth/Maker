import AppLink from '@/components/AppLink';

export default function NotFound(){return <main className="not-found"><p className="eyebrow">404 · OUTSIDE THE REPORT</p><h1>This chapter isn’t here.</h1><p>Return to the report or open the analytical Studio.</p><AppLink href="/" className="button dark">Back to the report</AppLink><AppLink href="/studio/" className="button">Open Studio</AppLink></main>}
