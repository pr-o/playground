'use client';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const baseURL = '/apps/youtube';

const items = [
  {
    title: 'History',
    url: `${baseURL}/playlists/history`,
    icon: HistoryIcon,
    auth: true,
  },
  {
    title: 'Liked videos',
    url: `${baseURL}/playlists/liked`,
    icon: ThumbsUpIcon,
    auth: true,
  },
  {
    title: 'All playlists',
    url: `${baseURL}/playlists`,
    icon: ListVideoIcon,
    auth: true,
  },
];

export const PersonalSection = () => {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarGroupLabel>Your</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={pathname === item.url}
                onClick={(e) => {}}
              >
                <Link prefetch href={item.url} className="flex items-center gap-4">
                  <item.icon />
                  <span className="text-sm">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
