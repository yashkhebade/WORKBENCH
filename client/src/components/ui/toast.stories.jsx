import { ToastProvider, Toast, ToastTitle, ToastDescription } from './toast';
export default { title: 'UI/Toast', component: Toast };
export const Default = () => <ToastProvider><Toast><ToastTitle>Success</ToastTitle><ToastDescription>Action completed</ToastDescription></Toast></ToastProvider>;