import { createFileRoute } from '@tanstack/react-router';
import { Home } from '@/components/shop/home';
import { meta } from '@/lib/shop/data';
export const Route = createFileRoute('/')({head:()=>meta('Tecnologia para o seu próximo passo','Encontre smartphones, notebooks, áudio e muito mais. Confira ofertas e lançamentos selecionados na CShop.'),component:Home});
