import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div className="pl-64">
        <main className="min-h-screen bg-gray-50">{children}</main>
      </div>
    </>
  );
}
