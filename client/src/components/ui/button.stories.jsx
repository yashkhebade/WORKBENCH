import { Button } from './button';
export default { title: 'UI/Button', component: Button };
export const Default = { args: { children: 'Button' } };
export const Destructive = { args: { children: 'Danger', variant: 'destructive' } };
export const Ghost = { args: { children: 'Ghost', variant: 'ghost' } };