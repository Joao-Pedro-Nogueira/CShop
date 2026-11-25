import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage, profileTabs, type ProfileTab } from "@/components/shop/profile";

export const Route = createFileRoute("/perfil")({
  validateSearch: (s: { tab?: unknown }): { tab?: ProfileTab | undefined } => ({
    tab: profileTabs.some((t) => t.id === s.tab) ? (s.tab as ProfileTab) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Meu perfil | CShop" },
      {
        name: "description",
        content: "Gerencie seus dados, pedidos, favoritos, endereços e formas de pagamento.",
      },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { tab } = Route.useSearch();
  return <ProfilePage tab={tab ?? "dados"} />;
}
