import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/components/shop/home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CShop — Tecnologia para o seu próximo passo" },
      {
        name: "description",
        content:
          "Smartphones, notebooks, áudio, TVs e muito mais. Confira ofertas e lançamentos selecionados na CShop.",
      },
      { property: "og:title", content: "CShop — Tecnologia para o seu próximo passo" },
      { property: "og:description", content: "Eletrônicos, novidades e ofertas selecionadas." },
    ],
  }),
  component: Home,
});
