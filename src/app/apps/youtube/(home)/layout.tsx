import { HomeLayout } from '@/components/apps/youtube/layouts/home';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <HomeLayout>
      <div>{children}</div>
    </HomeLayout>
  );
};

export default Layout;
