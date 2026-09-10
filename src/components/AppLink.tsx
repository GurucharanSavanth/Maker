import type {AnchorHTMLAttributes} from 'react';
import {sitePath} from '@/lib/paths';
export default function AppLink({href, ...props}:AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} href={href ? sitePath(href) : href}/>;
}
