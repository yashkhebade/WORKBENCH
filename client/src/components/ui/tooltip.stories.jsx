import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';
export default { title: 'UI/Tooltip', component: Tooltip };
export const Default = () => <TooltipProvider><Tooltip><TooltipTrigger>Hover me</TooltipTrigger><TooltipContent>Tooltip Content</TooltipContent></Tooltip></TooltipProvider>;