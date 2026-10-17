import { redirect } from 'next/navigation';

export default function AdminMarketplaceLinksPage() {
  redirect('/admin?tab=marketplaces');
}
