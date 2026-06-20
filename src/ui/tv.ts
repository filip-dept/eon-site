import { createTV } from 'tailwind-variants';
import { twMergeConfig } from '@/lib/cn';

/** tailwind-variants pre-configured with our custom token groups, so its internal
 *  tailwind-merge resolves conflicts correctly (font-size vs text-colour, custom
 *  radii, …). All `ui/` primitives build their variant maps with this `tv`. */
export const tv = createTV({ twMergeConfig });
