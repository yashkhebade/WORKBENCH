import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';
export default { title: 'UI/Select', component: Select };
export const Default = () => <Select><SelectTrigger className='w-[180px]'><SelectValue placeholder='Theme' /></SelectTrigger><SelectContent><SelectItem value='light'>Light</SelectItem><SelectItem value='dark'>Dark</SelectItem></SelectContent></Select>;