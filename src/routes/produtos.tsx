import { createFileRoute } from "@tanstack/react-router";
import { Catalog, validateCatalogSearch } from "@/components/shop/catalog";

export const Route = createFileRoute("/produtos")({
  validateSearch: validateCatalogSearch,
  head: () => ({
    meta: [
      { title: "Produtos | CShop" },
      {
        name: "description",
        content:
          "Filtre e compare smartphones, notebooks, fones, TVs, câmeras, games e acessórios na CShop.",
      },
      { property: "og:title", content: "Produtos | CShop" },
      {
        property: "og:description",
        content: "Filtre e compare eletrônicos com os melhores preços.",
      },
    ],
  }),
  component: ProdutosPage,
});

function ProdutosPage() {
  const search = Route.useSearch();
  return <Catalog search={search} />;
}
