import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from './dialog';
export default { title: 'UI/Dialog', component: Dialog };
export const Default = () => <Dialog><DialogTrigger>Open</DialogTrigger><DialogContent><DialogTitle>Are you sure?</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogContent></Dialog>;