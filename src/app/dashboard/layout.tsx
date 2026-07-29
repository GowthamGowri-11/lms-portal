export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No Navbar or outer wrapper — dashboards have their own sidebar
  return <>{children}</>;
}
