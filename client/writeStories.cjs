const fs = require('fs');
const path = require('path');
const uiDir = path.join('E:/WORKBENCH/client/src/components/ui');

const templates = {
  'button.stories.jsx': `import { Button } from './button';\nexport default { title: 'UI/Button', component: Button };\nexport const Default = { args: { children: 'Button' } };\nexport const Destructive = { args: { children: 'Danger', variant: 'destructive' } };\nexport const Ghost = { args: { children: 'Ghost', variant: 'ghost' } };`,
  'input.stories.jsx': `import { Input } from './input';\nexport default { title: 'UI/Input', component: Input };\nexport const Default = { args: { placeholder: 'Type here...' } };`,
  'badge.stories.jsx': `import { Badge } from './badge';\nexport default { title: 'UI/Badge', component: Badge };\nexport const Default = { args: { children: 'Badge' } };\nexport const Destructive = { args: { children: 'Danger', variant: 'destructive' } };`,
  'avatar.stories.jsx': `import { Avatar, AvatarImage, AvatarFallback } from './avatar';\nexport default { title: 'UI/Avatar', component: Avatar };\nexport const Default = () => <Avatar><AvatarImage src='https://github.com/shadcn.png' /><AvatarFallback>CN</AvatarFallback></Avatar>;`,
  'progress.stories.jsx': `import { Progress } from './progress';\nexport default { title: 'UI/Progress', component: Progress };\nexport const Default = { args: { value: 60 } };`,
  'tabs.stories.jsx': `import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';\nexport default { title: 'UI/Tabs', component: Tabs };\nexport const Default = () => <Tabs defaultValue='account' className='w-[400px]'><TabsList><TabsTrigger value='account'>Account</TabsTrigger><TabsTrigger value='password'>Password</TabsTrigger></TabsList><TabsContent value='account'>Account Content</TabsContent><TabsContent value='password'>Password Content</TabsContent></Tabs>;`,
  'select.stories.jsx': `import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';\nexport default { title: 'UI/Select', component: Select };\nexport const Default = () => <Select><SelectTrigger className='w-[180px]'><SelectValue placeholder='Theme' /></SelectTrigger><SelectContent><SelectItem value='light'>Light</SelectItem><SelectItem value='dark'>Dark</SelectItem></SelectContent></Select>;`,
  'calendar.stories.jsx': `import { Calendar } from './calendar';\nexport default { title: 'UI/Calendar', component: Calendar };\nexport const Default = { args: { mode: 'single', selected: new Date() } };`,
  'dialog.stories.jsx': `import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from './dialog';\nexport default { title: 'UI/Dialog', component: Dialog };\nexport const Default = () => <Dialog><DialogTrigger>Open</DialogTrigger><DialogContent><DialogTitle>Are you sure?</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogContent></Dialog>;`,
  'tooltip.stories.jsx': `import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';\nexport default { title: 'UI/Tooltip', component: Tooltip };\nexport const Default = () => <TooltipProvider><Tooltip><TooltipTrigger>Hover me</TooltipTrigger><TooltipContent>Tooltip Content</TooltipContent></Tooltip></TooltipProvider>;`,
  'toast.stories.jsx': `import { ToastProvider, Toast, ToastTitle, ToastDescription } from './toast';\nexport default { title: 'UI/Toast', component: Toast };\nexport const Default = () => <ToastProvider><Toast><ToastTitle>Success</ToastTitle><ToastDescription>Action completed</ToastDescription></Toast></ToastProvider>;`
};

for (const [file, content] of Object.entries(templates)) {
  fs.writeFileSync(path.join(uiDir, file), content);
}
console.log('Created all story files');
