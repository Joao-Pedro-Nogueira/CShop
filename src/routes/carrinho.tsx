import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/components/shop/cart";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho | CShop" },
      {
        name: "description",
        content:
          "Revise seus itens, aplique cupons, calcule o frete e finalize sua compra na CShop.",
      },
    ],
  }),
  component: CartPage,
});
