import type { Metadata } from 'next';
import './globals.css';
import './signal-theme.css';
export const metadata: Metadata = { title: {default:'Airtel × Jio — From Promise to Experience',template:'%s | Airtel × Jio'}, description:'An interactive services marketing audit of Airtel and Jio, with a survey intelligence Studio and transparent evidence.', robots:{index:false,follow:false} };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
