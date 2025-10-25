import { HomeLayout } from '@/components/apps/youtube/layouts/home';
import { ClerkProvider } from '@clerk/nextjs';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <ClerkProvider afterSignOutUrl="/apps/youtube">
      <HomeLayout>
        <div>{children}</div>
      </HomeLayout>
    </ClerkProvider>
  );
};

export default Layout;
