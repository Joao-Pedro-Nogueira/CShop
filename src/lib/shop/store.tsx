import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {toast} from 'sonner';
import {initialAddresses,initialOrders,products,type Address,type SavedCard,type CartItem,type Order} from './data';
export type User={name:string;email:string;phone:string;cpf:string;birth:string;avatar:string;joined:string};
type State={cart:CartItem[];favorites:number[];user:User;addresses:Address[];cards:SavedCard[];orders:Order[];theme:'light'|'dark';loggedIn:boolean};
const initial:State={cart:[],favorites:[3,8],user:{name:'João Pedro Nogueira',email:'joao.nogueira@example.com',phone:'(11) 99999-1234',cpf:'***.456.789-**',birth:'1995-05-15',avatar:'',joined:'2025-03-12'},addresses:initialAddresses,cards:[{id:1,last:'4242',brand:'Visa',expiry:'12/29',name:'JOAO PEDRO NOGUEIRA'},{id:2,last:'5678',brand:'Mastercard',expiry:'08/28',name:'JOAO PEDRO NOGUEIRA'}],orders:initialOrders,theme:'light',loggedIn:true};
type Shop=State&{ready:boolean;update:(patch:Partial<State>)=>void;add:(id:number,quantity?:number)=>void;remove:(id:number)=>void;quantity:(id:number,n:number)=>void;favorite:(id:number)=>void};
const Context=createContext<Shop|null>(null);
export function ShopProvider({children}:{children:ReactNode}){const [state,setState]=useState<State>(initial);const [ready,setReady]=useState(false);useEffect(()=>{try{const saved=localStorage.getItem('cshop-state');if(saved)setState({...initial,...JSON.parse(saved)});}catch{}setReady(true);},[]);useEffect(()=>{if(!ready)return;localStorage.setItem('cshop-state',JSON.stringify(state));document.documentElement.classList.toggle('dark',state.theme==='dark');},[state,ready]);
const update=(patch:Partial<State>)=>setState(s=>({...s,...patch}));
const add=(id:number,n=1)=>{const p=products.find(p=>p.id===id);if(!p||!p.stock)return;setState(s=>{const current=s.cart.find(i=>i.id===id);const quantity=Math.min(p.stock,(current?.quantity??0)+n);return {...s,cart:current?s.cart.map(i=>i.id===id?{...i,quantity}:i):[...s.cart,{id,quantity}]};});toast.success('Produto adicionado ao carrinho');};
const remove=(id:number)=>{setState(s=>({...s,cart:s.cart.filter(i=>i.id!==id)}));toast('Produto removido do carrinho');};
const quantity=(id:number,n:number)=>{const p=products.find(p=>p.id===id);if(!p||n<1||n>p.stock)return;setState(s=>({...s,cart:s.cart.map(i=>i.id===id?{...i,quantity:n}:i)}));};
const favorite=(id:number)=>{const exists=state.favorites.includes(id);setState(s=>({...s,favorites:s.favorites.includes(id)?s.favorites.filter(i=>i!==id):[...s.favorites,id]}));toast(exists?'Produto removido dos favoritos':'Produto adicionado aos favoritos');};
return <Context.Provider value={{...state,ready,update,add,remove,quantity,favorite}}>{children}</Context.Provider>;}
export function useShop(){const value=useContext(Context);if(!value)throw new Error('ShopProvider missing');return value;}
