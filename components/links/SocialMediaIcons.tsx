'use client';

import { CSSProperties } from 'react';
import { SocialMediaType } from '@/types';

interface IconBaseProps {
  className?: string;
  size?: number;
  style?: CSSProperties;
}

interface SocialMediaIconProps extends IconBaseProps {
  type: SocialMediaType;
}

export function TelegramIcon({ className = '', size = 24, style }: IconBaseProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="currentColor"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export function DiscordIcon({ className = '', size = 24, style }: IconBaseProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="currentColor"
    >
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

export function XIcon({ className = '', size = 24, style }: IconBaseProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="currentColor"
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

export function SocialMediaIcon({ type, className = '', size = 24, style }: SocialMediaIconProps) {
  if (!type) return null;

  const iconProps = { className, size, style };

  switch (type) {
    case 'telegram':
      return <TelegramIcon {...iconProps} />;
    case 'discord':
      return <DiscordIcon {...iconProps} />;
    case 'x':
      return <XIcon {...iconProps} />;
    default:
      return null;
  }
}

export const SOCIAL_MEDIA_CONFIG = {
  telegram: {
    name: 'Telegram',
    color: '#0088cc',
    icon: TelegramIcon,
    placeholder: 'https://t.me/your-group',
    urlPattern: /^https?:\/\/(t\.me|telegram\.me)/i,
  },
  discord: {
    name: 'Discord',
    color: '#5865F2',
    icon: DiscordIcon,
    placeholder: 'https://discord.gg/invite-code',
    urlPattern: /^https?:\/\/(discord\.(gg|com)|discordapp\.com)/i,
  },
  x: {
    name: 'X (Twitter)',
    color: '#000000',
    icon: XIcon,
    placeholder: 'https://x.com/username or community link',
    urlPattern: /^https?:\/\/(x\.com|twitter\.com)/i,
  },
} as const;

export function detectSocialMediaType(url: string): SocialMediaType {
  for (const [type, config] of Object.entries(SOCIAL_MEDIA_CONFIG)) {
    if (config.urlPattern.test(url)) {
      return type as SocialMediaType;
    }
  }
  return null;
}
