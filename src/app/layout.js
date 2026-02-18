import './globals.css';
import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'Gulf Cement - Digital Dispatch & Command Control',
  description: 'Enterprise-grade digital dispatch and command control platform for Gulf Cement operations',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
