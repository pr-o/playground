interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <div></div>
      {children}
    </div>
  );
};

export default Layout;
